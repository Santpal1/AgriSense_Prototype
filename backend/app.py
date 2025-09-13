from flask import Flask, request, jsonify
import joblib
import tensorflow as tf
import numpy as np
from PIL import Image
from flask_cors import CORS
import mysql.connector
import os
import pandas as pd

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",  # set your MySQL password
    "database": "satellite_data"
}
LATEST_IMAGE_PATH = "latest_truecolor.jpg" 

# -----------------------
# Recreate the custom class for crop stress
# -----------------------
class CropStressModel:
    def __init__(self, rf_model, label_encoder):
        self.rf = rf_model
        self.le = label_encoder

    def predict_and_recommend(self, X):
        y_pred = self.rf.predict(X)
        labels = self.le.inverse_transform(y_pred)

        recs = []
        for label in labels:
            if label == 'severe':
                recs.append({
                    'irrigation': 'High: 10-12mm',
                    'fertilizer': 'Nitrogen-rich'
                })
            elif label == 'mild':
                recs.append({
                    'irrigation': 'Medium: 5-7mm',
                    'fertilizer': 'Balanced'
                })
            else:
                recs.append({
                    'irrigation': 'Low: 2-3mm',
                    'fertilizer': 'None'
                })

        return labels, recs

# -----------------------
# Initialize Flask app
# -----------------------
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# -----------------------
# Load models
# -----------------------
crop_pipeline: CropStressModel = joblib.load("models/crop_model_pipeline.pkl")
cnn_model = tf.keras.models.load_model("models/crop_health_model.h5")
pest_model = tf.keras.models.load_model("models/pest_risk_lstm_model.h5", compile=False)
soil_model, soil_scaler, soil_imputer = joblib.load("models/soil_health_regressor.pkl")

# -----------------------
# Soil health helper functions
# -----------------------
def compute_soil_index_bounds():
    conn = mysql.connector.connect(**DB_CONFIG)
    c = conn.cursor(dictionary=True)
    c.execute("SELECT NDVI_mean, NDWI_mean, SWIR_mean, NDSI_mean FROM crop_stats")
    rows = c.fetchall()
    conn.close()

    if not rows:
        return 0, 1  # fallback

    df = pd.DataFrame(rows)
    # replicate the same soil index formula
    df["soil_index"] = (
        0.3 * df["NDVI_mean"]
        + 0.3 * df["NDWI_mean"]
        + 0.2 * (1 - df["NDSI_mean"].abs())
        + 0.2 * df["SWIR_mean"]
    )
    return df["soil_index"].min(), df["soil_index"].max()

soil_min, soil_max = compute_soil_index_bounds()

def categorize_soil_health(shi, min_val, max_val):
    norm = (shi - min_val) / (max_val - min_val + 1e-9)  # normalize 0-1
    if norm >= 0.66:
        return "healthy"
    elif norm >= 0.33:
        return "moderate"
    else:
        return "poor"

# -----------------------
# Endpoint 1: Stress & Recommendations (index-based model)
# -----------------------
@app.route("/predict/stress", methods=["POST"])
def predict_stress():
    try:
        data = request.json
        features = np.array(data["features"]).reshape(1, -1)

        labels, recs = crop_pipeline.predict_and_recommend(features)

        return jsonify({
            "stress_label": labels[0],
            "recommendations": recs[0]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -----------------------
# Endpoint 2: CNN Crop Health (image-based, binary classifier)
# -----------------------
@app.route("/predict/crop-health", methods=["POST"])
def predict_crop_health():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        img = Image.open(file).resize((128, 128))  # match CNN input
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Binary classification: model outputs [[p]]
        prediction = cnn_model.predict(img_array, verbose=0)[0][0]

        if prediction > 0.5:
            class_name = "unhealthy"
            confidence = float(prediction)  # confidence for unhealthy
        else:
            class_name = "healthy"
            confidence = float(1 - prediction)  # confidence for healthy

        return jsonify({
            "crop_health_class": class_name,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -----------------------
# Endpoint 3: Pest Risk Prediction (LSTM sequence model)
# -----------------------
@app.route("/predict/pest-risk", methods=["GET"])
def predict_pest_risk():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        c = conn.cursor(dictionary=True)

        # Fetch last 5 records (for sequence input)
        c.execute("SELECT * FROM crop_stats ORDER BY timestamp DESC LIMIT 5")
        rows = c.fetchall()
        conn.close()

        if len(rows) < 5:
            return jsonify({"error": "Not enough data for pest risk prediction"}), 400

        # Order by ascending timestamp (LSTM needs correct sequence order)
        rows = sorted(rows, key=lambda r: r["timestamp"])

        # Extract 6 features
        feature_names = [
            "NDVI_mean",
            "NDWI_mean",
            "NDSI_mean",
            "SWIR_mean",
            "FalseColor_mean",
            "TCI_mean"
        ]

        X_seq = []
        for r in rows:
            feats = [r[f] for f in feature_names]
            X_seq.append(feats)

        # Reshape into (1, timesteps, features)
        X_seq = np.array(X_seq).reshape(1, 5, 6)

        # Predict
        preds = pest_model.predict(X_seq, verbose=0)
        pred_idx = np.argmax(preds, axis=1)[0]
        confidence = float(np.max(preds))

        # Map to human-readable risk
        risk_levels = ["low", "medium", "high"]
        risk_label = risk_levels[pred_idx]

        # Recommendation mapping
        if risk_label == "low":
            recommendation = "✅ No immediate action required. Continue routine monitoring."
        elif risk_label == "medium":
            recommendation = "⚠️ Apply preventive measures (early pest detection, eco-friendly pesticides)."
        else:
            recommendation = "🚨 Immediate action required! Use strong pest control measures and monitor daily."

        return jsonify({
            "risk_level": risk_label,
            "confidence": round(confidence, 3),
            "recommendation": recommendation
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/predict/soil-health", methods=["GET"])
def predict_soil_health():
    try:
        # Optional params
        limit = request.args.get("limit", default=1, type=int)
        poor_thresh = request.args.get("poor", default=300, type=float)
        moderate_thresh = request.args.get("moderate", default=700, type=float)

        # Connect DB
        conn = mysql.connector.connect(**DB_CONFIG)
        c = conn.cursor(dictionary=True)
        c.execute(f"SELECT * FROM crop_stats ORDER BY timestamp DESC LIMIT {limit}")
        rows = c.fetchall()
        conn.close()

        if not rows:
            return jsonify({"error": "No data found"}), 404

        rows = sorted(rows, key=lambda r: r["timestamp"])  # oldest → newest

        # Load model, scaler, imputer
        model, scaler, imputer = joblib.load("models/soil_health_regressor.pkl")
        feature_names = ["FalseColor_mean", "NDVI_mean", "NDWI_mean", "SWIR_mean", "TCI_mean", "NDSI_mean"]

        results = []
        for row in rows:
            X = np.array([row[f] for f in feature_names]).reshape(1, -1)
            X = imputer.transform(X)
            X = scaler.transform(X)

            pred_val = float(model.predict(X)[0])

            # ✅ Threshold classification controlled by frontend
            if pred_val < poor_thresh:
                pred_class = "poor"
            elif poor_thresh <= pred_val <= moderate_thresh:
                pred_class = "moderate"
            else:
                pred_class = "healthy"

            results.append({
                "timestamp": row["timestamp"],
                "soil_health_index": round(pred_val, 3),
                "soil_health_class": pred_class,
                "thresholds": {
                    "poor": poor_thresh,
                    "moderate": moderate_thresh
                }
            })

        return jsonify(results[0] if limit == 1 else results)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -----------------------
# Endpoint: Latest crop stats
# -----------------------
@app.route("/latest-crop-stats", methods=["GET"])
def latest_crop_stats():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        c = conn.cursor(dictionary=True)
        # Fetch the latest row
        c.execute("SELECT * FROM crop_stats ORDER BY timestamp DESC LIMIT 1")
        row = c.fetchone()
        conn.close()

        if not row:
            return jsonify({"error": "No data found"}), 404

        # Ensure frontend can access image
        image_url = f"/static/{os.path.basename(LATEST_IMAGE_PATH)}"

        return jsonify({
            "timestamp": row["timestamp"],
            "indices": {
                "NDVI": {"mean": row["NDVI_mean"], "median": row["NDVI_median"], "std": row["NDVI_std"]},
                "NDWI": {"mean": row["NDWI_mean"], "median": row["NDWI_median"], "std": row["NDWI_std"]},
                "NDSI": {"mean": row["NDSI_mean"], "median": row["NDSI_median"], "std": row["NDSI_std"]},
                "SWIR": {"mean": row["SWIR_mean"], "median": row["SWIR_median"], "std": row["SWIR_std"]},
                "FalseColor": {"mean": row["FalseColor_mean"], "median": row["FalseColor_median"], "std": row["FalseColor_std"]},
                "TCI": {"mean": row["TCI_mean"], "median": row["TCI_median"], "std": row["TCI_std"]}
            },
            "true_color_image": image_url
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -----------------------
# Endpoint: Last 5 crop stats (for analytics/graphs)
# -----------------------
@app.route("/recent-crop-stats", methods=["GET"])
def recent_crop_stats():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        c = conn.cursor(dictionary=True)

        # Fetch last 5 rows sorted by date (most recent first)
        c.execute("SELECT * FROM crop_stats ORDER BY timestamp DESC LIMIT 5")
        rows = c.fetchall()
        conn.close()

        if not rows:
            return jsonify({"error": "No data found"}), 404

        # Sort rows ascending (so frontend gets time series correctly)
        rows = sorted(rows, key=lambda r: r["timestamp"])

        # Build response
        response = []
        for row in rows:
            response.append({
                "timestamp": row["timestamp"],
                "indices": {
                    "NDVI": {"mean": row["NDVI_mean"], "median": row["NDVI_median"], "std": row["NDVI_std"]},
                    "NDWI": {"mean": row["NDWI_mean"], "median": row["NDWI_median"], "std": row["NDWI_std"]},
                    "NDSI": {"mean": row["NDSI_mean"], "median": row["NDSI_median"], "std": row["NDSI_std"]},
                    "SWIR": {"mean": row["SWIR_mean"], "median": row["SWIR_median"], "std": row["SWIR_std"]},
                    "FalseColor": {"mean": row["FalseColor_mean"], "median": row["FalseColor_median"], "std": row["FalseColor_std"]},
                    "TCI": {"mean": row["TCI_mean"], "median": row["TCI_median"], "std": row["TCI_std"]}
                }
            })

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -----------------------
# Run app
# -----------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
