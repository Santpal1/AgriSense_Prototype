import React, { useEffect, useState } from "react";
import { Download, CheckCircle2, Upload, Camera, Activity, TrendingUp, Leaf, AlertCircle, RefreshCw, BarChart3, Zap, Droplets, Sun } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, Legend } from "recharts";
import axios from "axios";

const CropHealth = () => {
  const [latestData, setLatestData] = useState(null);
  const [recentStats, setRecentStats] = useState([]);
  const [cropHealth, setCropHealth] = useState(null);
  const [stressData, setStressData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingStress, setLoadingStress] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch all data
  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [latestRes, recentRes] = await Promise.all([
        axios.get("http://localhost:5000/latest-crop-stats"),
        axios.get("http://localhost:5000/recent-crop-stats")
      ]);
      
      setLatestData(latestRes.data);
      setRecentStats(recentRes.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch crop data.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setCropHealth(null); // Reset previous results
    } else {
      setImagePreview(null);
    }
  };

  const handlePredictHealth = async () => {
    if (!imageFile) {
      setError("Please upload an image first!");
      return;
    }

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
    if (!latestData) {
      setError("No crop stats available for stress analysis.");
      return;
    }

    setLoadingStress(true);
    setError(null);

    try {
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

  // Prepare chart data
  const prepareNormalizedIndicesData = () => {
    if (!recentStats.length) return [];
    return recentStats.map((stat, index) => ({
      day: `Day ${index + 1}`,
      NDVI: stat.indices.NDVI.mean,
      NDWI: stat.indices.NDWI.mean,
      NDSI: stat.indices.NDSI.mean,
      timestamp: new Date(stat.timestamp).toLocaleDateString()
    }));
  };

  const prepareIndexComparisonData = () => {
    if (!latestData) return [];
    return Object.entries(latestData.indices).map(([key, values]) => ({
      name: key,
      mean: values.mean,
      median: values.median,
      std: values.std
    }));
  };

  // Health status helpers
  const getStressHealthStatus = (stressLevel) => {
    if (stressLevel === 'none') return { status: 'Excellent', color: '#10B981', icon: <CheckCircle2 size={20} /> };
    if (stressLevel === 'mild') return { status: 'Fair', color: '#F59E0B', icon: <AlertCircle size={20} /> };
    if (stressLevel === 'severe') return { status: 'Poor', color: '#EF4444', icon: <AlertCircle size={20} /> };
    return { status: 'Unknown', color: '#6B7280', icon: <AlertCircle size={20} /> };
  };

  const getStressColor = (stressLevel) => {
    switch (stressLevel) {
      case 'none': return '#10B981';
      case 'mild': return '#F59E0B';
      case 'severe': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loadingData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #10B981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>Loading crop health data...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const chartData = prepareNormalizedIndicesData();
  const comparisonData = prepareIndexComparisonData();

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1F2937', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Leaf style={{ color: '#10B981' }} />
            Crop Health Analysis
          </h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={fetchAllData}
            style={{
              background: '#10B981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
          <button 
            style={{
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          background: '#FEF2F2', 
          border: '1px solid #FECACA', 
          color: '#DC2626', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Health Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Show health status only for valid stress_label */}
        {stressData && ['none', 'mild', 'severe'].includes(stressData.stress_label) && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderLeft: `6px solid ${getStressHealthStatus(stressData.stress_label).color}`,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: getStressHealthStatus(stressData.stress_label).color }}>
                {getStressHealthStatus(stressData.stress_label).icon}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#1F2937', fontSize: '1.25rem' }}>
                  Overall Health
                </h3>
                <p style={{ margin: 0, color: getStressHealthStatus(stressData.stress_label).color, fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {getStressHealthStatus(stressData.stress_label).status}
                </p>
              </div>
            </div>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
              Based on Stress Analysis
            </p>
          </div>
        )}

        {/* Key Metrics */}
        {latestData && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} />
              Key Indices
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#10B981',
                  margin: '0 0 0.25rem 0'
                }}>
                  {latestData.indices.NDVI.mean.toFixed(3)}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>NDVI</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#3B82F6',
                  margin: '0 0 0.25rem 0'
                }}>
                  {latestData.indices.NDWI.mean.toFixed(3)}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>NDWI</div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Actions */}
        {latestData && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} />
              Quick Analysis
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handlePredictStress}
                disabled={loadingStress}
                style={{
                  background: loadingStress ? '#9CA3AF' : '#F59E0B',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: loadingStress ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {loadingStress ? "Analyzing..." : "Run Stress Analysis"}
              </button>
              
              {stressData && (
                <div style={{ 
                  background: `${getStressColor(stressData.stress_label)}20`, 
                  color: getStressColor(stressData.stress_label),
                  padding: '0.75rem',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Stress Level: {stressData.stress_label.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Trend Chart */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Health Indices Trends (Last 5 Days)
          </h3>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[-1, 1]} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="NDVI" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="NDWI" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="NDSI" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              No trend data available
            </div>
          )}
        </div>

        {/* Index Comparison */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} />
            Current Index Values
          </h3>
          
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData.filter(d => ['NDVI', 'NDWI', 'NDSI'].includes(d.name))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="mean" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              No comparison data available
            </div>
          )}
        </div>
      </div>

      {/* Main Analysis Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Image Upload & Health Prediction */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} />
            Image Analysis
          </h3>
          
          <div style={{
            border: '2px dashed #D1D5DB',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div>
                <Upload size={48} style={{ color: '#9CA3AF', margin: '0 auto 1rem' }} />
                <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
                  Upload crop image for analysis
                </p>
              </div>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '14px'
            }}
          />
          
          <button
            onClick={handlePredictHealth}
            disabled={loadingHealth || !imageFile}
            style={{
              width: '100%',
              background: (loadingHealth || !imageFile) ? '#9CA3AF' : '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '6px',
              cursor: (loadingHealth || !imageFile) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '1rem'
            }}
          >
            {loadingHealth ? "Analyzing..." : "Analyze Image"}
          </button>

          {cropHealth && (
            <div style={{
              background: cropHealth.crop_health_class === 'healthy' ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${cropHealth.crop_health_class === 'healthy' ? '#A7F3D0' : '#FECACA'}`,
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <p style={{ 
                margin: 0, 
                color: cropHealth.crop_health_class === 'healthy' ? '#065F46' : '#DC2626',
                fontWeight: '500'
              }}>
                Health Status: {cropHealth.crop_health_class.toUpperCase()}
              </p>
              <p style={{ 
                margin: '0.25rem 0 0 0', 
                color: '#6B7280',
                fontSize: '14px'
              }}>
                Confidence: {(cropHealth.confidence * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} />
            Recommendations
          </h3>

          {stressData && stressData.recommendations ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(stressData.recommendations).map(([key, value]) => (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ color: '#10B981' }}>
                    {key === 'irrigation' ? <Droplets size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1F2937', textTransform: 'capitalize' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '0.25rem' }}>
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#6B7280', 
              padding: '2rem',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '2px dashed #D1D5DB'
            }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                Run stress analysis to get personalized recommendations
              </p>
            </div>
          )}
        </div>

        {/* Satellite Image */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} />
            Latest Satellite View
          </h3>

          {latestData && latestData.true_color_image ? (
            <div>
              <img
                src={`http://localhost:5000${latestData.true_color_image}`}
                alt="Latest Satellite"
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
                Satellite image not available
              </div>
              <p style={{ 
                margin: '1rem 0 0 0', 
                fontSize: '12px', 
                color: '#6B7280',
                textAlign: 'center'
              }}>
                Captured: {new Date(latestData.timestamp).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#6B7280', 
              padding: '2rem',
              background: '#F9FAFB',
              borderRadius: '8px',
              border: '2px dashed #D1D5DB'
            }}>
              <Camera size={48} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                No satellite image available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Index Table */}
      {latestData && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            background: '#F9FAFB', 
            padding: '1.5rem', 
            borderBottom: '1px solid #E5E7EB'
          }}>
            <h3 style={{ margin: 0, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} />
              Detailed Vegetation Indices
              <span style={{ 
                fontSize: '14px', 
                color: '#6B7280', 
                fontWeight: 'normal',
                marginLeft: '1rem'
              }}>
                {new Date(latestData.timestamp).toLocaleString()}
              </span>
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#374151', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>Index</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>Mean</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>Median</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>Std Dev</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#374151', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>Health Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#374151', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(latestData.indices).map(([key, values], index) => {
                  const getIndexStatus = (indexName, mean) => {
                    if (indexName === 'NDVI') {
                      if (mean > 0.6) return { text: 'Excellent', color: '#10B981' };
                      if (mean > 0.4) return { text: 'Good', color: '#84CC16' };
                      if (mean > 0.2) return { text: 'Fair', color: '#F59E0B' };
                      return { text: 'Poor', color: '#EF4444' };
                    }
                    if (indexName === 'NDWI') {
                      if (mean > 0.3) return { text: 'High Water', color: '#3B82F6' };
                      if (mean > 0) return { text: 'Moderate', color: '#10B981' };
                      return { text: 'Low Water', color: '#F59E0B' };
                    }
                    return { text: 'Normal', color: '#6B7280' };
                  };
                  
                  const getTrend = (indexName) => {
                    if (chartData.length < 2) return '—';
                    const current = chartData[chartData.length - 1]?.[indexName];
                    const previous = chartData[chartData.length - 2]?.[indexName];
                    if (!current || !previous) return '—';
                    
                    if (current > previous * 1.02) return { icon: '↗️', color: '#10B981', text: 'Rising' };
                    if (current < previous * 0.98) return { icon: '↘️', color: '#EF4444', text: 'Falling' };
                    return { icon: '➡️', color: '#6B7280', text: 'Stable' };
                  };
                  
                  const status = getIndexStatus(key, values.mean);
                  const trend = getTrend(key);
                  
                  return (
                    <tr key={key} style={{ 
                      background: index % 2 === 0 ? 'white' : '#F9FAFB'
                    }}>
                      <td style={{ 
                        padding: '1rem', 
                        fontWeight: '600', 
                        color: '#1F2937',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        {key}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right', 
                        color: '#374151',
                        fontFamily: 'monospace',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        {key === 'SWIR' || key === 'FalseColor' || key === 'TCI' ? 
                          values.mean.toFixed(1) : values.mean.toFixed(4)}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right', 
                        color: '#374151',
                        fontFamily: 'monospace',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        {key === 'SWIR' || key === 'FalseColor' || key === 'TCI' ? 
                          values.median.toFixed(1) : values.median.toFixed(4)}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right', 
                        color: '#374151',
                        fontFamily: 'monospace',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        {key === 'SWIR' || key === 'FalseColor' || key === 'TCI' ? 
                          values.std.toFixed(1) : values.std.toFixed(4)}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'center',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        <span style={{
                          background: `${status.color}20`,
                          color: status.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {status.text}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'center',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        {typeof trend === 'object' ? (
                          <span style={{
                            color: trend.color,
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}>
                            {trend.icon} {trend.text}
                          </span>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>{trend}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropHealth;