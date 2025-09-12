import React, { useEffect, useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import axios from "axios";

const CropHealth = () => {
  const [latestData, setLatestData] = useState(null);
  const [cropHealth, setCropHealth] = useState(null);
  const [stressData, setStressData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingStress, setLoadingStress] = useState(false);
  const [error, setError] = useState(null);

  // Fetch latest crop stats on mount
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/latest-crop-stats");
        setLatestData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch latest crop stats.");
      }
    };
    fetchLatestData();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handlePredictHealth = async () => {
    if (!imageFile) return alert("Please upload an image!");

    setLoadingHealth(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const healthRes = await axios.post(
        "http://localhost:5000/predict/crop-health",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setCropHealth(healthRes.data);
    } catch (err) {
      console.error(err);
      setError("Crop health prediction failed.");
    } finally {
      setLoadingHealth(false);
    }
  };

  const handlePredictStress = async () => {
    if (!latestData) return alert("No crop stats available.");

    setLoadingStress(true);
    setError(null);

    try {
      // Flatten mean, median, std of each index into 18 features
      const indices = latestData.indices;
      const features = [
        indices.NDVI.mean, indices.NDVI.median, indices.NDVI.std,
        indices.NDWI.mean, indices.NDWI.median, indices.NDWI.std,
        indices.NDSI.mean, indices.NDSI.median, indices.NDSI.std,
        indices.SWIR.mean, indices.SWIR.median, indices.SWIR.std,
        indices.FalseColor.mean, indices.FalseColor.median, indices.FalseColor.std,
        indices.TCI.mean, indices.TCI.median, indices.TCI.std
      ];

      const stressRes = await axios.post(
        "http://localhost:5000/predict/stress",
        { features }
      );

      setStressData(stressRes.data);
    } catch (err) {
      console.error(err);
      setError("Stress analysis failed.");
    } finally {
      setLoadingStress(false);
    }
  };


  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="page-title">Crop Health Analysis</h2>
        <button className="btn primary">
          <Download className="btn-icon" />
          Export Report
        </button>
      </div>

      {/* Spectral Health Image */}
      {latestData && (
        <div className="health-map-card">
          <h3 className="section-title">Latest True-Color Image</h3>
          <img
            src={`http://localhost:5000${latestData.true_color_image}`}
            alt="Latest True Color"
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "8px"
            }}
          />
          <p className="text-sm mt-1">Data timestamp: {latestData.timestamp}</p>
        </div>
      )}

      {/* Vegetation Indices */}
      {latestData && (
        <div className="indices-grid mt-4">
          {Object.entries(latestData.indices).map(([key, val]) => (
            <div key={key} className="index-card">
              <h4 className="index-title">{key}</h4>
              <div className="index-value green">{val.mean.toFixed(3)}</div>
              <div className="index-description">{key} mean value</div>
              <div className="progress-bar">
                <div
                  className="progress-fill green"
                  style={{ width: `${Math.min(Math.abs(val.mean) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Triple Box Dashboard */}
      <div className="triple-box-layout">
        {/* Left: Stress Analysis */}
        <div className="triple-box left">
          <div className="dotted-box">
            <h3 className="section-title">Stress Analysis</h3>
            <button
              className="btn secondary"
              onClick={handlePredictStress}
              disabled={loadingStress}
            >
              {loadingStress ? "Analyzing Stress..." : "Run Stress Analysis"}
            </button>
            {error && !loadingStress && (
              <p className="text-red-500 mt-2">{error}</p>
            )}
            {stressData && (
              <div className="stress-card mt-2">
                <p>
                  <strong>Stress Level:</strong> {stressData.stress_label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Recommendations */}
        <div className="triple-box center">
          <h3 className="recommend-title">Recommended Actions</h3>
          {stressData ? (
            <div className="recommend-cards">
              {Object.entries(stressData.recommendations).map(([key, value], idx) => (
                <div className="recommend-card" key={key}>
                  <CheckCircle2 className="recommend-icon" />
                  <div>
                    <span className="recommend-key">{key}</span>
                    <div className="recommend-value">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2">Run stress analysis to get recommendations.</p>
          )}
        </div>

        {/* Right: Crop Health Prediction */}
        <div className="triple-box right">
          <h3 className="section-title">Crop Health Prediction</h3>
          <div className="upload-card">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          {imagePreview && (
            <div className="image-preview-box mt-2">
              <img
                src={imagePreview}
                alt="Uploaded Preview"
                className="uploaded-image"
              />
            </div>
          )}
          <div className="btn-group mt-2">
            <button
              className="btn primary mr-2"
              onClick={handlePredictHealth}
              disabled={loadingHealth}
            >
              {loadingHealth ? "Predicting..." : "Run Crop Health Prediction"}
            </button>
          </div>
          {error && !loadingHealth && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
          {cropHealth && (
            <div className="prediction-card mt-2">
              <p>
                <strong>Crop Health:</strong> {cropHealth.crop_health_class} (
                {Math.round(cropHealth.confidence * 100)}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropHealth;
