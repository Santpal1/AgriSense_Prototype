import React, { useEffect, useState } from "react";
import { AlertTriangle, Activity, TrendingUp, Calendar, RefreshCw, Shield, Bug, Leaf, Droplets } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const PestDetection = () => {
  const [pestRisk, setPestRisk] = useState(null);
  const [cropStats, setCropStats] = useState(null);
  const [recentStats, setRecentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch pest risk
      const pestRes = await fetch("http://localhost:5000/predict/pest-risk");
      const pestData = await pestRes.json();

      if (pestData.error) throw new Error(pestData.error);

      // Fetch latest crop stats
      const cropRes = await fetch("http://localhost:5000/latest-crop-stats");
      const cropData = await cropRes.json();

      // Fetch recent stats for trends
      const recentRes = await fetch("http://localhost:5000/recent-crop-stats");
      const recentData = await recentRes.json();

      setPestRisk(pestData);
      setCropStats(cropData);
      setRecentStats(recentData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data
  const prepareChartData = () => {
    if (!recentStats.length) return [];
    return recentStats.map((stat, index) => ({
      day: `Day ${index + 1}`,
      NDVI: stat.indices.NDVI.mean,
      NDWI: stat.indices.NDWI.mean,
      NDSI: stat.indices.NDSI.mean,
      SWIR: stat.indices.SWIR.mean,
      timestamp: new Date(stat.timestamp).toLocaleDateString()
    }));
  };

  // Prepare chart data for normalized indices (SWIR normalized to -1..1)
  const prepareNormalizedIndicesData = () => {
    if (!recentStats.length) return [];
    // Find max SWIR value for normalization (or use a fixed value, e.g., 5000)
    const swirMax = 5000;
    return recentStats.map((stat, index) => ({
      day: `Day ${index + 1}`,
      NDVI: stat.indices.NDVI.mean,
      NDWI: stat.indices.NDWI.mean,
      NDSI: stat.indices.NDSI.mean,
      SWIR: stat.indices.SWIR.mean / swirMax,
      timestamp: new Date(stat.timestamp).toLocaleDateString()
    }));
  };

  // Prepare chart data for SWIR index (if needed)
  const prepareSWIRData = () => {
    if (!recentStats.length) return [];
    return recentStats.map((stat, index) => ({
      day: `Day ${index + 1}`,
      SWIR: stat.indices.SWIR.mean,
      timestamp: new Date(stat.timestamp).toLocaleDateString()
    }));
  };

  // Risk level colors and icons
  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return <Shield className="w-8 h-8" />;
      case 'medium': return <AlertTriangle className="w-8 h-8" />;
      case 'high': return <Bug className="w-8 h-8" />;
      default: return <Activity className="w-8 h-8" />;
    }
  };

  // Pie chart data for index distribution (SWIR normalized)
  const getPieData = () => {
    if (!cropStats) return [];
    const indices = cropStats.indices;
    const swirMax = 5000;
    return [
      { name: 'NDVI', value: Math.abs(indices.NDVI.mean), color: '#10B981' },
      { name: 'NDWI', value: Math.abs(indices.NDWI.mean), color: '#3B82F6' },
      { name: 'NDSI', value: Math.abs(indices.NDSI.mean), color: '#8B5CF6' },
      { name: 'SWIR', value: Math.abs(indices.SWIR.mean / swirMax), color: '#F59E0B' }
    ];
  };

  if (loading) {
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
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>Loading pest risk analysis...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        margin: '2rem'
      }}>
        <AlertTriangle style={{ color: '#EF4444', width: '48px', height: '48px', margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#DC2626', marginBottom: '0.5rem' }}>Error Loading Data</h3>
        <p style={{ color: '#7F1D1D', marginBottom: '1rem' }}>{error}</p>
        <button 
          onClick={fetchData}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const chartData = prepareNormalizedIndicesData();
  const swirChartData = prepareSWIRData();
  const pieData = getPieData();

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
            <Bug style={{ color: '#EF4444' }} />
            Pest Detection & Risk Assessment
          </h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <button 
          onClick={fetchData}
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
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* Risk Level Cards */}
      {pestRisk && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Main Risk Card */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderLeft: `6px solid ${getRiskColor(pestRisk.risk_level)}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: getRiskColor(pestRisk.risk_level) }}>
                {getRiskIcon(pestRisk.risk_level)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1F2937' }}>
                  Risk Level: {pestRisk.risk_level.toUpperCase()}
                </h3>
                <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                  Confidence: {(pestRisk.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Confidence Bar */}
            <div style={{ 
              background: '#F3F4F6', 
              height: '8px', 
              borderRadius: '4px', 
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: getRiskColor(pestRisk.risk_level),
                height: '100%',
                width: `${pestRisk.confidence * 100}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            
            <p style={{ 
              margin: 0, 
              color: '#374151', 
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {pestRisk.recommendation}
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} />
              Key Metrics
            </h3>
            
            {cropStats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#10B981',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {cropStats.indices.NDVI.mean.toFixed(3)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>NDVI Mean</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#3B82F6',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {cropStats.indices.NDWI.mean.toFixed(3)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>NDWI Mean</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#8B5CF6',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {cropStats.indices.NDSI.mean.toFixed(3)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>NDSI Mean</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#F59E0B',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {cropStats.indices.SWIR.mean.toFixed(3)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>SWIR Mean</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
            Index Trends (Last 5 Days)
          </h3>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Line type="monotone" dataKey="NDVI" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="NDWI" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="NDSI" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="SWIR" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              No trend data available
            </div>
          )}
        </div>

        {/* Index Distribution */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Leaf size={20} />
            Index Distribution
          </h3>
          
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  fontSize={12}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              No distribution data available
            </div>
          )}
        </div>
      </div>

      {/* Detailed Data Table */}
      {cropStats && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: '#F9FAFB', 
            padding: '1.5rem', 
            borderBottom: '1px solid #E5E7EB'
          }}>
            <h3 style={{ margin: 0, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} />
              Latest Crop Indices Analysis
              <span style={{ 
                fontSize: '14px', 
                color: '#6B7280', 
                fontWeight: 'normal',
                marginLeft: '1rem'
              }}>
                {new Date(cropStats.timestamp).toLocaleString()}
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
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#374151', fontWeight: '600', borderBottom: '1px solid #E5E7EB' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cropStats.indices).map(([key, values], index) => {
                  const getStatus = (mean) => {
                    if (key === 'NDVI') {
                      if (mean > 0.6) return { text: 'Healthy', color: '#10B981' };
                      if (mean > 0.3) return { text: 'Moderate', color: '#F59E0B' };
                      return { text: 'Stressed', color: '#EF4444' };
                    }
                    return { text: 'Normal', color: '#6B7280' };
                  };
                  
                  const status = getStatus(values.mean);
                  
                  return (
                    <tr key={key} style={{ 
                      background: index % 2 === 0 ? 'white' : '#F9FAFB',
                      '&:hover': { background: '#F3F4F6' }
                    }}>
                      <td style={{ 
                        padding: '1rem', 
                        fontWeight: '500', 
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
                        {values.mean.toFixed(4)}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right', 
                        color: '#374151',
                        fontFamily: 'monospace',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        {values.median.toFixed(4)}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right', 
                        color: '#374151',
                        fontFamily: 'monospace',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        {values.std.toFixed(4)}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Satellite Image */}
      {cropStats && cropStats.true_color_image && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplets size={20} />
            Latest Satellite Imagery
          </h3>
          
          <div style={{ 
            textAlign: 'center',
            background: '#F9FAFB',
            padding: '2rem',
            borderRadius: '8px'
          }}>
            <img
              src={`http://localhost:5000${cropStats.true_color_image}`}
              alt="Latest Satellite True Color"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', color: '#6B7280', padding: '2rem' }}>
              Satellite image not available
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PestDetection;