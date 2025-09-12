import React, { useState } from "react";
import { fixedSensorPoints } from "../data/mockData";

const FieldMap = () => {
  const [mapView, setMapView] = useState("Health View");

  const fieldMapStyle = {
    background:
      mapView === "Satellite"
        ? `url('field.jpg')`
        : "linear-gradient(135deg, #a7f3d0, #16a34a)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="content-section">
      <h2 className="page-title">Field Mapping & Monitoring</h2>
      
      {/* Map Interface */}
      <div className="map-card">
        <div className="map-header">
          <h3 className="section-title">Interactive Field Map</h3>
          <div className="map-controls">
            <button
              className={`map-btn ${mapView === "Satellite" ? "active" : ""}`}
              onClick={() => setMapView("Satellite")}
            >
              Satellite
            </button>
            <button
              className={`map-btn ${mapView === "Health View" ? "active" : ""}`}
              onClick={() => setMapView("Health View")}
            >
              Health View
            </button>
            <button
              className={`map-btn ${mapView === "Thermal" ? "active" : ""}`}
              onClick={() => setMapView("Thermal")}
            >
              Thermal
            </button>
          </div>
        </div>

        {/* Simulated Map */}
        <div className="field-map" style={fieldMapStyle}>
          <div className="field-boundaries"></div>
          <div className="field-section field-a">
            <div className="field-info">
              <div className="field-name">Field A</div>
              <div className="field-details">Corn - 45 ha</div>
            </div>
          </div>
          <div className="field-section field-b">
            <div className="field-info">
              <div className="field-name">Field B</div>
              <div className="field-details">Wheat - 38 ha</div>
            </div>
          </div>
          <div className="field-section field-c">
            <div className="field-info">
              <div className="field-name">Field C</div>
              <div className="field-details">Soybean - 52 ha</div>
            </div>
          </div>

          {/* Sensor points */}
          {fixedSensorPoints.map((pt, i) => (
            <div
              key={i}
              className="sensor-point"
              style={{ top: `${pt.top}%`, left: `${pt.left}%` }}
            >
              <div className="sensor-tooltip">Sensor {i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Details */}
      <div className="zones-grid">
        <div className="zone-summary-card">
          <h3 className="section-title">Zone Health Summary</h3>
          <div className="zone-list">
            <div className="zone-item excellent">
              <div className="zone-info">
                <div className="zone-name">Zone A - North Field</div>
                <div className="zone-details">Corn, 45 hectares</div>
              </div>
              <div className="zone-status">Excellent</div>
            </div>
            <div className="zone-item good">
              <div className="zone-info">
                <div className="zone-name">Zone B - East Field</div>
                <div className="zone-details">Wheat, 38 hectares</div>
              </div>
              <div className="zone-status">Good</div>
            </div>
            <div className="zone-item attention">
              <div className="zone-info">
                <div className="zone-name">Zone C - South Field</div>
                <div className="zone-details">Soybean, 52 hectares</div>
              </div>
              <div className="zone-status">Needs Attention</div>
            </div>
          </div>
        </div>

        <div className="satellite-card">
          <h3 className="section-title">Recent Satellite Passes</h3>
          <div className="satellite-list">
            <div className="satellite-item">
              <div className="satellite-info">
                <div className="satellite-name">Sentinel-2 MSI</div>
                <div className="satellite-resolution">10m resolution</div>
              </div>
              <div className="satellite-time recent">2 hours ago</div>
            </div>
            <div className="satellite-item">
              <div className="satellite-info">
                <div className="satellite-name">Landsat 8 OLI</div>
                <div className="satellite-resolution">30m resolution</div>
              </div>
              <div className="satellite-time">1 day ago</div>
            </div>
            <div className="satellite-item">
              <div className="satellite-info">
                <div className="satellite-name">MODIS Terra</div>
                <div className="satellite-resolution">250m resolution</div>
              </div>
              <div className="satellite-time">3 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldMap;