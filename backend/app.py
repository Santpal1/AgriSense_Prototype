from flask import Flask, request, jsonify
import joblib
import tensorflow as tf
import numpy as np
from PIL import Image
from flask_cors import CORS
import mysql.connector
import os

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

# Load models
crop_pipeline: CropStressModel = joblib.load("models/crop_model_pipeline.pkl")
cnn_model = tf.keras.models.load_model("models/crop_health_model.h5")

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
# Run app
# -----------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
