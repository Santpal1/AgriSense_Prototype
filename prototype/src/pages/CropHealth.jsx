import React from "react";
import { Download } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { healthData } from "../data/mockData";

const CropHealth = () => {
  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="page-title">Crop Health Analysis</h2>
        <button className="btn primary">
          <Download className="btn-icon" />
          Export Report
        </button>
      </div>

      {/* Health Map Simulation */}
      <div className="health-map-card">
        <h3 className="section-title">Spectral Health Map</h3>
        <div className="health-map">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`health-point ${
                i % 3 === 0 ? "critical" : i % 3 === 1 ? "warning" : "healthy"
              }`}
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
              }}
            />
          ))}
          <div className="map-legend">
            <p className="legend-title">Legend:</p>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color healthy"></div>
                <span>Healthy</span>
              </div>
              <div className="legend-item">
                <div className="legend-color warning"></div>
                <span>Stressed</span>
              </div>
              <div className="legend-item">
                <div className="legend-color critical"></div>
                <span>Critical</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vegetation Indices */}
      <div className="indices-grid">
        <div className="index-card">
          <h4 className="index-title">NDVI Analysis</h4>
          <div className="index-value green">0.73</div>
          <div className="index-description">
            Normalized Difference Vegetation Index
          </div>
          <div className="progress-bar">
            <div className="progress-fill green" style={{ width: "73%" }}></div>
          </div>
        </div>

        <div className="index-card">
          <h4 className="index-title">SAVI Analysis</h4>
          <div className="index-value blue">0.68</div>
          <div className="index-description">
            Soil Adjusted Vegetation Index
          </div>
          <div className="progress-bar">
            <div className="progress-fill blue" style={{ width: "68%" }}></div>
          </div>
        </div>

        <div className="index-card">
          <h4 className="index-title">EVI Analysis</h4>
          <div className="index-value purple">0.71</div>
          <div className="index-description">Enhanced Vegetation Index</div>
          <div className="progress-bar">
            <div
              className="progress-fill purple"
              style={{ width: "71%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Temporal Analysis */}
      <div className="chart-card">
        <h3 className="section-title">Temporal Health Analysis</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={healthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="ndvi"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="stress"
              stackId="2"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="disease"
              stackId="3"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CropHealth;