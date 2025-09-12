import React from "react";

const Settings = () => {
  return (
    <div className="content-section">
      <h2 className="page-title">Platform Settings</h2>

      <div className="settings-grid">
        <div className="settings-card">
          <h3 className="section-title">Model Configuration</h3>
          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">CNN Model Sensitivity</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="85"
                className="slider"
              />
              <div className="slider-labels">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">LSTM Prediction Window</label>
              <select className="form-select">
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Alert Threshold</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="slider"
              />
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 className="section-title">Data Sources</h3>
          <div className="data-sources">
            <div className="data-source-item active">
              <div className="source-info">
                <div className="source-name">Hyperspectral Imaging</div>
                <div className="source-desc">MATLAB Integration</div>
              </div>
              <div className="status-indicator active"></div>
            </div>
            <div className="data-source-item active">
              <div className="source-info">
                <div className="source-name">Environmental Sensors</div>
                <div className="source-desc">IoT Network</div>
              </div>
              <div className="status-indicator active"></div>
            </div>
            <div className="data-source-item warning">
              <div className="source-info">
                <div className="source-name">Weather API</div>
                <div className="source-desc">Meteorological Data</div>
              </div>
              <div className="status-indicator warning"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="notifications-card">
        <h3 className="section-title">Notification Preferences</h3>
        <div className="notifications-grid">
          <div className="notification-group">
            <div className="notification-item">
              <span>Crop Health Alerts</span>
              <input type="checkbox" defaultChecked className="checkbox" />
            </div>
            <div className="notification-item">
              <span>Soil Condition Updates</span>
              <input type="checkbox" defaultChecked className="checkbox" />
            </div>
            <div className="notification-item">
              <span>Pest Risk Warnings</span>
              <input type="checkbox" defaultChecked className="checkbox" />
            </div>
          </div>
          <div className="notification-group">
            <div className="notification-item">
              <span>Weather Alerts</span>
              <input type="checkbox" defaultChecked className="checkbox" />
            </div>
            <div className="notification-item">
              <span>Weekly Reports</span>
              <input type="checkbox" defaultChecked className="checkbox" />
            </div>
            <div className="notification-item">
              <span>Mobile Notifications</span>
              <input type="checkbox" defaultChecked className="checkbox" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;