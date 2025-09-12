import React from "react";
import { Download } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { soilData } from "../data/mockData";

const SoilAnalysis = () => {
  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="page-title">Soil Analysis</h2>
        <button className="btn primary blue">
          <Download className="btn-icon" />
          Download Data
        </button>
      </div>

      {/* Soil Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h4 className="soil-metric-title blue">Moisture Content</h4>
          <div className="soil-metric-value">44%</div>
          <div className="soil-metric-desc">Average across zones</div>
          <div className="progress-bar">
            <div className="progress-fill blue" style={{ width: "44%" }}></div>
          </div>
        </div>

        <div className="metric-card">
          <h4 className="soil-metric-title red">Temperature</h4>
          <div className="soil-metric-value">22.3°C</div>
          <div className="soil-metric-desc">Surface temperature</div>
          <div className="progress-bar">
            <div className="progress-fill red" style={{ width: "60%" }}></div>
          </div>
        </div>

        <div className="metric-card">
          <h4 className="soil-metric-title green">pH Level</h4>
          <div className="soil-metric-value">6.9</div>
          <div className="soil-metric-desc">Slightly acidic</div>
          <div className="progress-bar">
            <div className="progress-fill green" style={{ width: "69%" }}></div>
          </div>
        </div>

        <div className="metric-card">
          <h4 className="soil-metric-title purple">Nitrogen</h4>
          <div className="soil-metric-value">74</div>
          <div className="soil-metric-desc">ppm average</div>
          <div className="progress-bar">
            <div
              className="progress-fill purple"
              style={{ width: "74%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Soil Data Chart */}
      <div className="chart-card">
        <h3 className="section-title">Soil Conditions by Zone</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={soilData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="zone" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="moisture" fill="#3b82f6" name="Moisture %" />
            <Bar dataKey="temperature" fill="#ef4444" name="Temperature °C" />
            <Bar dataKey="nitrogen" fill="#10b981" name="Nitrogen ppm" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Environmental Sensors */}
      <div className="sensors-card">
        <h3 className="section-title">Environmental Sensor Readings</h3>
        <div className="sensors-grid">
          <div className="sensor-item">
            <div className="sensor-value blue">78%</div>
            <div className="sensor-label">Air Humidity</div>
          </div>
          <div className="sensor-item">
            <div className="sensor-value green">25°C</div>
            <div className="sensor-label">Air Temperature</div>
          </div>
          <div className="sensor-item">
            <div className="sensor-value purple">12 km/h</div>
            <div className="sensor-label">Wind Speed</div>
          </div>
          <div className="sensor-item">
            <div className="sensor-value orange">45%</div>
            <div className="sensor-label">Leaf Wetness</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilAnalysis;