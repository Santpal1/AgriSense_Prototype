import React, { useState, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_URL;

// Mock data for sensor points
const fixedSensorPoints = [
  { top: 20, left: 30 },
  { top: 40, left: 60 },
  { top: 70, left: 25 },
  { top: 35, left: 80 }
];

const FieldMap = () => {
  const [indices, setIndices] = useState(null);
  const [soilHealth, setSoilHealth] = useState(null);
  const [pestRisk, setPestRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Fetch all data from multiple endpoints
  const fetchAllData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setLoading(!indices); // Only show loading on initial load
      
      // Fetch crop statistics
      const [cropResponse, soilResponse, pestResponse] = await Promise.allSettled([
        fetch(`${API_BASE}/latest-crop-stats`),
        fetch(`${API_BASE}/predict/soil-health`),
        fetch(`${API_BASE}/predict/pest-risk`)
      ]);

      // Handle crop stats
      if (cropResponse.status === 'fulfilled' && cropResponse.value.ok) {
        const cropData = await cropResponse.value.json();
        setIndices({
          NDSI: cropData.indices.NDSI.mean,
          NDVI: cropData.indices.NDVI.mean,
          NDWI: cropData.indices.NDWI.mean,
          SWIR: cropData.indices.SWIR.mean,
          FalseColor: cropData.indices.FalseColor.mean,
          TCI: cropData.indices.TCI.mean
        });
        setLastUpdate(new Date(cropData.timestamp).toLocaleString());
      }

      // Handle soil health
      if (soilResponse.status === 'fulfilled' && soilResponse.value.ok) {
        const soilData = await soilResponse.value.json();
        setSoilHealth(soilData);
      }

      // Handle pest risk
      if (pestResponse.status === 'fulfilled' && pestResponse.value.ok) {
        const pestData = await pestResponse.value.json();
        setPestRisk(pestData);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load field data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Function to get color based on index value and type
  const getIndexColor = (value, type) => {
    switch (type) {
      case 'NDVI':
        return value > 0.3 ? '#22c55e' : value > 0 ? '#84cc16' : '#ef4444';
      case 'NDWI':
        return value > 0 ? '#3b82f6' : '#f59e0b';
      case 'NDSI':
        return value > 0 ? '#8b5cf6' : '#6b7280';
      case 'SWIR':
        return value > 5000 ? '#ef4444' : value > 3000 ? '#f59e0b' : '#22c55e';
      case 'FalseColor':
        return value > 150 ? '#22c55e' : value > 100 ? '#f59e0b' : '#ef4444';
      case 'TCI':
        return value > 150 ? '#22c55e' : value > 100 ? '#f59e0b' : '#ef4444';
      default:
        return '#6366f1';
    }
  };

  // Function to get status text based on index
  const getIndexStatus = (value, type) => {
    switch (type) {
      case 'NDVI':
        return value > 0.3 ? 'Healthy' : value > 0 ? 'Moderate' : 'Poor';
      case 'NDWI':
        return value > 0 ? 'High Water' : 'Low Water';
      case 'NDSI':
        return value > 0 ? 'Snow/Ice' : 'Clear';
      case 'SWIR':
        return value > 5000 ? 'High Stress' : value > 3000 ? 'Moderate' : 'Good';
      case 'FalseColor':
        return value > 150 ? 'Excellent' : value > 100 ? 'Good' : 'Poor';
      case 'TCI':
        return value > 150 ? 'Excellent' : value > 100 ? 'Good' : 'Poor';
      default:
        return 'Normal';
    }
  };

  const getIndexDescription = (type) => {
    const descriptions = {
      'NDVI': 'Normalized Difference Vegetation Index',
      'NDWI': 'Normalized Difference Water Index',
      'NDSI': 'Normalized Difference Snow Index',
      'SWIR': 'Short-Wave Infrared',
      'FalseColor': 'False Color Composite',
      'TCI': 'True Color Image Index'
    };
    return descriptions[type] || '';
  };

  const getSoilHealthColor = (classification) => {
    switch (classification?.toLowerCase()) {
      case 'healthy': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPestRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Overlay color mapping for indices
  const getOverlayColor = (type) => {
    switch (type) {
      case 'NDVI': return 'rgba(34,197,94,0.35)';
      case 'NDWI': return 'rgba(59,130,246,0.35)';
      case 'NDSI': return 'rgba(139,92,246,0.35)';
      case 'SWIR': return 'rgba(245,158,11,0.35)';
      case 'FalseColor': return 'rgba(34,197,94,0.35)';
      case 'TCI': return 'rgba(34,197,94,0.35)';
      default: return 'rgba(99,102,241,0.25)';
    }
  };

  if (loading && !indices) {
    return (
      <div className="fieldmap-bg fieldmap-center">
        <div className="fieldmap-text-center">
          <div className="fieldmap-spinner"></div>
          <p className="fieldmap-text-gray">Loading field data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fieldmap-bg fieldmap-padding">
      <div className="fieldmap-container">
        {/* Header */}
        <div className="fieldmap-flex fieldmap-justify-between fieldmap-items-center fieldmap-mb-8">
          <div>
            <h2 className="fieldmap-title">Field Mapping & Monitoring</h2>
            <p className="fieldmap-subtitle">Real-time agricultural insights and analysis</p>
          </div>
          <button
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
            className={`fieldmap-btn-refresh${refreshing ? " fieldmap-btn-refreshing" : ""}`}
          >
            <svg className={`fieldmap-refresh-icon${refreshing ? " fieldmap-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="fieldmap-grid-main">
          {/* Map Interface */}
          <div>
            <div className="fieldmap-card fieldmap-h-full">
              <div className="fieldmap-card-padding">
                <h3 className="fieldmap-card-title">Field Overview</h3>
                <div className="fieldmap-map-area">
                  {/* Satellite image as background */}
                  <img
                    src={`${API_BASE}/static/latest_truecolor.jpg`}
                    alt="Satellite True Color"
                    className="fieldmap-map-img"
                  />
                  <div className="fieldmap-map-label">
                    Satellite View
                  </div>
                  {/* Overlay for selected index */}
                  {selectedIndex && (
                    <div
                      className="fieldmap-index-overlay"
                      style={{
                        background: getOverlayColor(selectedIndex),
                        zIndex: 2,
                      }}
                    >
                      <span className="fieldmap-overlay-text">
                        {selectedIndex} Visualization
                      </span>
                      <button
                        className="fieldmap-overlay-close"
                        onClick={() => setSelectedIndex(null)}
                        title="Close overlay"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vegetation Indices */}
          <div className="fieldmap-xl-span-2">
            <div className="fieldmap-card fieldmap-card-padding fieldmap-h-full">
              <div className="fieldmap-flex fieldmap-justify-between fieldmap-items-center fieldmap-mb-6">
                <h3 className="fieldmap-card-title-xl">Vegetation Indices</h3>
                <div className="fieldmap-flex fieldmap-items-center fieldmap-space-x-2">
                  {refreshing ? (
                    <>
                      <div className="fieldmap-live-dot"></div>
                      <span className="fieldmap-live-text">Updating...</span>
                    </>
                  ) : error ? (
                    <>
                      <div className="fieldmap-error-dot"></div>
                      <span className="fieldmap-error-text">Error</span>
                    </>
                  ) : (
                    <>
                      <div className="fieldmap-live-dot-green"></div>
                      <span className="fieldmap-live-text-green">Live</span>
                    </>
                  )}
                </div>
              </div>
              {error && (
                <div className="fieldmap-error-box">
                  <p className="fieldmap-error-msg">{error}</p>
                </div>
              )}
              
              {indices ? (
                <div className="fieldmap-grid-indices">
                  {Object.entries(indices).map(([key, value]) => {
                    const color = getIndexColor(value, key);
                    const status = getIndexStatus(value, key);
                    const description = getIndexDescription(key);
                    
                    return (
                      <div key={key} className="fieldmap-group">
                        <div
                          className={`fieldmap-index-card${selectedIndex === key ? " fieldmap-index-card-selected" : ""}`}
                          onClick={() => setSelectedIndex(selectedIndex === key ? null : key)}
                          style={{ cursor: "pointer" }}
                          title={`Visualize ${key} on map`}
                        >
                          <div className="fieldmap-flex fieldmap-justify-between fieldmap-items-center fieldmap-mb-3">
                            <div className="fieldmap-flex fieldmap-items-center fieldmap-space-x-3">
                              <div 
                                className="fieldmap-index-dot"
                                style={{ backgroundColor: color }}
                              ></div>
                              <div>
                                <div className="fieldmap-index-title">{key}</div>
                                <div className="fieldmap-index-desc">{description}</div>
                              </div>
                            </div>
                            
                            <div className="fieldmap-text-right">
                              <div className="fieldmap-index-value">
                                {typeof value === 'number' ? (
                                  key === 'SWIR' || key === 'FalseColor' || key === 'TCI' ? 
                                    value.toFixed(1) : 
                                    value.toFixed(4)
                                ) : 'N/A'}
                              </div>
                              <div 
                                className="fieldmap-index-status"
                                style={{
                                  backgroundColor: `${color}15`,
                                  color: color
                                }}
                              >
                                {status}
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress bar for normalized indices */}
                          {key !== 'SWIR' && key !== 'FalseColor' && key !== 'TCI' && (
                            <div className="fieldmap-mt-3">
                              <div className="fieldmap-progress-bg">
                                <div 
                                  className="fieldmap-progress-bar"
                                  style={{ 
                                    backgroundColor: color,
                                    width: `${Math.max(0, Math.min(100, (value + 1) * 50))}%`
                                  }}
                                ></div>
                              </div>
                              <div className="fieldmap-progress-labels">
                                <span>-1.0</span>
                                <span>0</span>
                                <span>1.0</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="fieldmap-no-data">
                  No vegetation index data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Analysis Cards */}
        <div className="fieldmap-grid-bottom">
          {/* Soil Health Card */}
          <div className="fieldmap-card fieldmap-card-padding">
            <h3 className="fieldmap-card-title-lg">
              <div className="fieldmap-icon-bg fieldmap-icon-amber">🌱</div>
              Soil Health
            </h3>
            {soilHealth ? (
              <div>
                <div className="fieldmap-flex fieldmap-justify-between fieldmap-items-center fieldmap-mb-3">
                  <span className="fieldmap-soil-index">
                    {soilHealth.soil_health_index}
                  </span>
                  <span
                    className="fieldmap-soil-status"
                    style={{ backgroundColor: getSoilHealthColor(soilHealth.soil_health_class) }}
                  >
                    {soilHealth.soil_health_class?.charAt(0).toUpperCase() + soilHealth.soil_health_class?.slice(1)}
                  </span>
                </div>
                <div className="fieldmap-soil-desc">
                  Health Index Rating
                </div>
              </div>
            ) : (
              <div className="fieldmap-loading-msg">
                Loading soil analysis...
              </div>
            )}
          </div>

          {/* Pest Risk Card */}
          <div className="fieldmap-card fieldmap-card-padding">
            <h3 className="fieldmap-card-title-lg">
              <div className="fieldmap-icon-bg fieldmap-icon-red">🐛</div>
              Pest Risk
            </h3>
            {pestRisk ? (
              <div>
                <div className="fieldmap-flex fieldmap-justify-between fieldmap-items-center fieldmap-mb-3">
                  <span
                    className="fieldmap-pest-risk"
                    style={{ color: getPestRiskColor(pestRisk.risk_level) }}
                  >
                    {pestRisk.risk_level?.charAt(0).toUpperCase() + pestRisk.risk_level?.slice(1)}
                  </span>
                  <span className="fieldmap-pest-confidence">
                    {(pestRisk.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
                <div className="fieldmap-pest-recommendation">
                  {pestRisk.recommendation}
                </div>
              </div>
            ) : (
              <div className="fieldmap-loading-msg">
                Analyzing pest risk...
              </div>
            )}
          </div>

          {/* Satellite Data Card */}
          <div className="fieldmap-card fieldmap-card-padding">
            <h3 className="fieldmap-card-title-lg">
              <div className="fieldmap-icon-bg fieldmap-icon-blue">🛰️</div>
              Satellite Data
            </h3>
            <div className="fieldmap-space-y-3">
              <div className="fieldmap-flex fieldmap-justify-between fieldmap-items-center">
                <div>
                  <div className="fieldmap-satellite-title">Sentinel-2 MSI</div>
                  <div className="fieldmap-satellite-desc">10m resolution</div>
                </div>
                <div className="fieldmap-text-right">
                  <div className={`fieldmap-satellite-status${lastUpdate ? " fieldmap-satellite-active" : ""}`}>
                    {lastUpdate ? 'Active' : 'Offline'}
                  </div>
                  <div className="fieldmap-satellite-date">
                    {lastUpdate || 'No data'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CSS Styles */}
      <style>
        {`
        .fieldmap-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #eff6ff 0%, #d1fae5 100%);
          padding: 24px;
        }
        .fieldmap-padding { padding: 24px; }
        .fieldmap-container { max-width: 1200px; margin: 0 auto; }
        .fieldmap-center { display: flex; align-items: center; justify-content: center; }
        .fieldmap-text-center { text-align: center; }
        .fieldmap-spinner {
          animation: spin 1s linear infinite;
          border-radius: 50%;
          height: 48px;
          width: 48px;
          border-bottom: 4px solid #2563eb;
          margin: 0 auto 16px auto;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .fieldmap-text-gray { color: #64748b; }
        .fieldmap-title { font-size: 2rem; font-weight: bold; color: #111827; }
        .fieldmap-subtitle { color: #64748b; margin-top: 8px; }
        .fieldmap-flex { display: flex; }
        .fieldmap-justify-between { justify-content: space-between; }
        .fieldmap-items-center { align-items: center; }
        .fieldmap-mb-8 { margin-bottom: 32px; }
        .fieldmap-btn-refresh {
          padding: 8px 16px;
          background: #2563eb;
          color: #fff;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
          opacity: 1;
        }
        .fieldmap-btn-refresh:hover:not(:disabled) { background: #1d4ed8; }
        .fieldmap-btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
        .fieldmap-refresh-icon { width: 16px; height: 16px; }
        .fieldmap-spin { animation: spin 1s linear infinite; }
        .fieldmap-grid-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 1280px) {
          .fieldmap-grid-main { grid-template-columns: 1fr; }
          .fieldmap-xl-span-2 { margin-top: 24px; }
        }
        .fieldmap-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .fieldmap-card-padding { padding: 24px; }
        .fieldmap-h-full { height: 100%; }
        .fieldmap-card-title { font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 16px; }
        .fieldmap-map-area {
          position: relative;
          aspect-ratio: 1 / 1;
          background: linear-gradient(135deg, #bbf7d0 0%, #d1fae5 100%);
          border-radius: 12px;
          overflow: hidden;
        }
        .fieldmap-map-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .fieldmap-map-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #15803d;
          font-weight: 500;
          font-size: 1.1rem;
          z-index: 1;
          background: rgba(255,255,255,0.08);
        }
        .fieldmap-index-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          pointer-events: auto;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .fieldmap-overlay-text {
          position: absolute;
          left: 50%;
          top: 16px;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.45);
          color: #fff;
          padding: 6px 18px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          z-index: 3;
        }
        .fieldmap-overlay-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #fff;
          color: #111827;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
          z-index: 4;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .fieldmap-btn-refresh:hover:not(:disabled) { background: #1d4ed8; }
        .fieldmap-btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
        .fieldmap-refresh-icon { width: 16px; height: 16px; }
        .fieldmap-spin { animation: spin 1s linear infinite; }
        .fieldmap-grid-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 1280px) {
          .fieldmap-grid-main { grid-template-columns: 1fr; }
          .fieldmap-xl-span-2 { margin-top: 24px; }
        }
        .fieldmap-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .fieldmap-card-padding { padding: 24px; }
        .fieldmap-h-full { height: 100%; }
        .fieldmap-card-title { font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 16px; }
        .fieldmap-map-area {
          position: relative;
          aspect-ratio: 1 / 1;
          background: linear-gradient(135deg, #bbf7d0 0%, #d1fae5 100%);
          border-radius: 12px;
          overflow: hidden;
        }
        .fieldmap-map-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .fieldmap-map-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #15803d;
          font-weight: 500;
          font-size: 1.1rem;
          z-index: 1;
          background: rgba(255,255,255,0.08);
        }
        .fieldmap-index-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          pointer-events: auto;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .fieldmap-overlay-text {
          position: absolute;
          left: 50%;
          top: 16px;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.45);
          color: #fff;
          padding: 6px 18px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          z-index: 3;
        }
        .fieldmap-overlay-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #fff;
          color: #111827;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
          z-index: 4;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .fieldmap-sensor-point {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          transform: translate(-50%, -50%);
          cursor: pointer;
          z-index: 10;
          transition: transform 0.2s;
        }
        .fieldmap-sensor-point:hover { transform: translate(-50%, -50%) scale(1.25); }
        .fieldmap-sensor-tooltip {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: #111827;
          color: #fff;
          font-size: 0.75rem;
          padding: 4px 12px;
          border-radius: 8px;
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .fieldmap-sensor-point:hover .fieldmap-sensor-tooltip { opacity: 1; }
        .fieldmap-xl-span-2 {}
        .fieldmap-card-title-xl { font-size: 1.25rem; font-weight: 600; color: #111827; }
        .fieldmap-mb-6 { margin-bottom: 24px; }
        .fieldmap-space-x-2 { gap: 8px; display: flex; align-items: center; }
        .fieldmap-live-dot {
          width: 12px; height: 12px; background: #2563eb; border-radius: 50%; animation: pulse 1s infinite alternate;
        }
        .fieldmap-live-text { font-size: 0.9rem; color: #2563eb; font-weight: 500; }
        .fieldmap-error-dot { width: 12px; height: 12px; background: #ef4444; border-radius: 50%; }
        .fieldmap-error-text { font-size: 0.9rem; color: #ef4444; }
        .fieldmap-live-dot-green { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; animation: pulse 1s infinite alternate; }
        .fieldmap-live-text-green { font-size: 0.9rem; color: #22c55e; font-weight: 500; }
        @keyframes pulse { 0% { opacity: 0.5; } 100% { opacity: 1; } }
        .fieldmap-error-box {
          margin-bottom: 24px;
          padding: 16px;
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          border-radius: 0 8px 8px 0;
        }
        .fieldmap-error-msg { font-size: 0.95rem; color: #b91c1c; }
        .fieldmap-grid-indices {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .fieldmap-grid-indices { grid-template-columns: 1fr; }
        }
        .fieldmap-group {}
        .fieldmap-index-card {
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #f3f4f6;
          background: linear-gradient(90deg, #fff 0%, #f9fafb 100%);
          transition: box-shadow 0.3s, border 0.3s;
        }
        .fieldmap-index-card:hover {
          border: 2px solid #e5e7eb;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .fieldmap-mb-3 { margin-bottom: 12px; }
        .fieldmap-space-x-3 { gap: 12px; display: flex; align-items: center; }
        .fieldmap-index-dot {
          width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.10);
        }
        .fieldmap-index-title { font-weight: bold; color: #111827; font-size: 1.1rem; }
        .fieldmap-index-desc { font-size: 0.8rem; color: #6b7280; }
        .fieldmap-text-right { text-align: right; }
        .fieldmap-index-value { font-weight: bold; font-size: 1.25rem; color: #111827; }
        .fieldmap-index-status {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 999px;
          margin-top: 4px;
          display: inline-block;
        }
        .fieldmap-mt-3 { margin-top: 12px; }
        .fieldmap-progress-bg {
          width: 100%;
          background: #e5e7eb;
          border-radius: 999px;
          height: 8px;
          overflow: hidden;
        }
        .fieldmap-progress-bar {
          height: 8px;
          border-radius: 999px;
          transition: width 0.7s;
        }
        .fieldmap-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 4px;
        }
        .fieldmap-no-data {
          text-align: center;
          padding: 32px 0;
          color: #6b7280;
        }
        .fieldmap-grid-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .fieldmap-grid-bottom { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .fieldmap-grid-bottom { grid-template-columns: 1fr; }
        }
        .fieldmap-card-title-lg {
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }
        .fieldmap-icon-bg {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-right: 12px;
        }
        .fieldmap-icon-amber { background: #fef3c7; }
        .fieldmap-icon-red { background: #fee2e2; }
        .fieldmap-icon-blue { background: #dbeafe; }
        .fieldmap-soil-index { font-size: 1.5rem; font-weight: bold; color: #111827; }
        .fieldmap-soil-status {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          display: inline-block;
        }
        .fieldmap-soil-desc { font-size: 0.95rem; color: #64748b; }
        .fieldmap-loading-msg { color: #6b7280; text-align: center; padding: 16px 0; }
        .fieldmap-pest-risk { font-size: 1.5rem; font-weight: bold; }
        .fieldmap-pest-confidence { font-size: 0.95rem; color: #64748b; }
        .fieldmap-pest-recommendation {
          font-size: 0.85rem;
          color: #64748b;
          background: #f9fafb;
          padding: 8px;
          border-radius: 8px;
        }
        .fieldmap-space-y-3 > * + * { margin-top: 12px; }
        .fieldmap-satellite-title { font-weight: 500; color: #111827; }
        .fieldmap-satellite-desc { font-size: 0.9rem; color: #6b7280; }
        .fieldmap-satellite-status { font-size: 0.95rem; font-weight: 500; color: #64748b; }
        .fieldmap-satellite-active { color: #22c55e; }
        .fieldmap-satellite-date { font-size: 0.8rem; color: #64748b; }
        `}
      </style>
    </div>
  );
};

export default FieldMap;