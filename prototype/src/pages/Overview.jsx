import React, { useEffect, useState } from "react";
import { 
  Leaf, 
  Bug, 
  Mountain, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  BarChart3,
  Beaker,
  Camera,
  Droplets,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const Overview = () => {
  const [overviewData, setOverviewData] = useState({
    cropHealth: null,
    pestRisk: null,
    soilAnalysis: null,
    cropStats: null,
    recentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [cropStatsRes, recentStatsRes, pestRiskRes, soilHealthRes] = await Promise.all([
        fetch("http://localhost:5000/latest-crop-stats"),
        fetch("http://localhost:5000/recent-crop-stats"),
        fetch("http://localhost:5000/predict/pest-risk"),
        fetch("http://localhost:5000/predict/soil-health?limit=1")
      ]);

      const cropStats = await cropStatsRes.json();
      const recentStats = await recentStatsRes.json();
      const pestRisk = await pestRiskRes.json();
      const soilHealth = await soilHealthRes.json();

      setOverviewData({
        cropHealth: cropStats,
        pestRisk: pestRisk,
        soilAnalysis: Array.isArray(soilHealth) ? soilHealth[0] : soilHealth,
        cropStats: cropStats,
        recentStats: recentStats
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching overview data:', err);
      setError("Failed to load overview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Helper functions
  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSoilHealthColor = (classification) => {
    switch (classification) {
      case 'healthy': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'poor': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Prepare chart data
  const prepareIndexTrendData = () => {
    if (!overviewData.recentStats.length) return [];
    return overviewData.recentStats.map((stat, index) => ({
      day: `Day ${index + 1}`,
      NDVI: stat.indices.NDVI.mean,
      NDWI: stat.indices.NDWI.mean,
      NDSI: stat.indices.NDSI.mean,
      timestamp: new Date(stat.timestamp).toLocaleDateString()
    }));
  };

  const prepareIndexComparisonData = () => {
    if (!overviewData.cropHealth) return [];
    const indices = overviewData.cropHealth.indices;
    return [
      { name: 'NDVI', value: indices.NDVI.mean, color: '#10B981' },
      { name: 'NDWI', value: indices.NDWI.mean, color: '#3B82F6' },
      { name: 'NDSI', value: indices.NDSI.mean, color: '#8B5CF6' },
      { name: 'SWIR', value: indices.SWIR.mean / 1000, color: '#F59E0B' } // Normalized for display
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
          borderTop: '3px solid #10B981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>Loading farm overview...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const chartData = prepareIndexTrendData();
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
            <Activity style={{ color: '#10B981' }} />
            Farm Management Overview
          </h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={fetchOverviewData}
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
            Refresh All
          </button>
          
        </div>
      </div>

      {/* Error Display */}
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
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Module Status Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Crop Health Module */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          borderLeft: '6px solid #10B981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              background: '#ECFDF5', 
              padding: '0.75rem', 
              borderRadius: '8px',
              color: '#10B981'
            }}>
              <Leaf size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#1F2937', fontSize: '1.25rem' }}>
                Crop Health Analysis
              </h3>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                AI-powered crop monitoring
              </p>
            </div>
          </div>
          
          {overviewData.cropHealth && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#10B981',
                  margin: '0 0 0.25rem 0'
                }}>
                  {overviewData.cropHealth.indices.NDVI.mean.toFixed(3)}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>NDVI Index</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#3B82F6',
                  margin: '0 0 0.25rem 0'
                }}>
                  {overviewData.cropHealth.indices.NDWI.mean.toFixed(3)}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>NDWI Index</div>
              </div>
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: '#F9FAFB',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Features Available
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '0.25rem' }}>
                • Image Analysis • Stress Detection • Satellite Monitoring
              </div>
            </div>
            <Eye style={{ color: '#10B981', width: '20px', height: '20px' }} />
          </div>
        </div>

        {/* Pest Detection Module */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          borderLeft: `6px solid ${overviewData.pestRisk ? getRiskColor(overviewData.pestRisk.risk_level) : '#6B7280'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              background: '#FEF2F2', 
              padding: '0.75rem', 
              borderRadius: '8px',
              color: '#EF4444'
            }}>
              <Bug size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#1F2937', fontSize: '1.25rem' }}>
                Pest Risk Assessment
              </h3>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                Early warning system
              </p>
            </div>
          </div>
          
          {overviewData.pestRisk && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: getRiskColor(overviewData.pestRisk.risk_level), textTransform: 'uppercase' }}>
                  {overviewData.pestRisk.risk_level} Risk
                </span>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>
                  {(overviewData.pestRisk.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
              <div style={{ 
                background: '#F3F4F6', 
                height: '6px', 
                borderRadius: '3px', 
                overflow: 'hidden'
              }}>
                <div style={{
                  background: getRiskColor(overviewData.pestRisk.risk_level),
                  height: '100%',
                  width: `${overviewData.pestRisk.confidence * 100}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          )}
          
          <div style={{ 
            background: '#F9FAFB',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Monitoring Capabilities
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
              • Real-time risk assessment • Satellite data analysis • Predictive modeling
            </div>
          </div>
        </div>

        {/* Soil Analysis Module */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          borderLeft: `6px solid ${overviewData.soilAnalysis ? getSoilHealthColor(overviewData.soilAnalysis.soil_health_class) : '#6B7280'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              background: '#FEF3C7', 
              padding: '0.75rem', 
              borderRadius: '8px',
              color: '#D97706'
            }}>
              <Mountain size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#1F2937', fontSize: '1.25rem' }}>
                Soil Health Analysis
              </h3>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                Comprehensive soil monitoring
              </p>
            </div>
          </div>
          
          {overviewData.soilAnalysis && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: getSoilHealthColor(overviewData.soilAnalysis.soil_health_class), textTransform: 'capitalize' }}>
                  {overviewData.soilAnalysis.soil_health_class}
                </span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  Index: {overviewData.soilAnalysis.soil_health_index}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Last updated: {new Date(overviewData.soilAnalysis.timestamp).toLocaleDateString()}
              </div>
            </div>
          )}
          
          <div style={{ 
            background: '#F9FAFB',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Analysis Features
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
              • Fertility prediction • Nutrient analysis • Health trending
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualization Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Index Trends Chart */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Vegetation Index Trends (Last 5 Days)
          </h3>
          
          {chartData.length > 0 ? (
  <ResponsiveContainer width="100%" height={350}>
    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
      <PolarGrid />
      <PolarAngleAxis dataKey="day" />
      <PolarRadiusAxis angle={30} domain={[-1, 1]} />
      <Radar
        name="NDVI"
        dataKey="NDVI"
        stroke="#10B981"
        fill="#10B981"
        fillOpacity={0.4}
      />
      <Radar
        name="NDWI"
        dataKey="NDWI"
        stroke="#3B82F6"
        fill="#3B82F6"
        fillOpacity={0.4}
      />
      <Radar
        name="NDSI"
        dataKey="NDSI"
        stroke="#8B5CF6"
        fill="#8B5CF6"
        fillOpacity={0.4}
      />
      <Legend />
    </RadarChart>
  </ResponsiveContainer>
) : (
  <div style={{ textAlign: "center", color: "#6B7280", padding: "3rem" }}>
    <BarChart3 size={48} style={{ margin: "0 auto 1rem", color: "#9CA3AF" }} />
    <p style={{ margin: 0, fontSize: "14px" }}>No trend data available</p>
  </div>
)}
        </div>

        {/* Current Index Distribution */}
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
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                 <Pie
  data={comparisonData
    .filter(d => ['NDVI', 'NDWI', 'NDSI'].includes(d.name))
    .map(d => ({ ...d, value: Math.abs(d.value) }))} // take absolute
  cx="50%"
  cy="50%"
  innerRadius={40}
  outerRadius={90}
  paddingAngle={3}
  dataKey="value"
>
  {comparisonData.filter(d => ['NDVI', 'NDWI', 'NDSI'].includes(d.name)).map((entry, index) => (
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
                    formatter={(value, name) => [`${value.toFixed(3)}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Custom Legend */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '1rem',
                marginTop: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {comparisonData.filter(d => ['NDVI', 'NDWI', 'NDSI'].includes(d.name)).map((entry, index) => (
                  <div key={entry.name} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: entry.color,
                      borderRadius: '2px'
                    }}></div>
                    <span style={{ color: '#374151' }}>
                      {entry.name}: {entry.originalValue ? entry.originalValue.toFixed(3) : entry.value.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '3rem' }}>
              <Activity size={48} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No index data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '1px solid #A7F3D0',
          padding: '1.5rem',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Camera style={{ color: '#10B981', width: '24px', height: '24px' }} />
            <h4 style={{ margin: 0, color: '#065F46', fontSize: '16px', fontWeight: '600' }}>
              Image Analysis
            </h4>
          </div>
          <p style={{ color: '#047857', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            Upload crop images for instant health assessment and disease detection using AI-powered analysis.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
          border: '1px solid #FCA5A5',
          padding: '1.5rem',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <AlertTriangle style={{ color: '#EF4444', width: '24px', height: '24px' }} />
            <h4 style={{ margin: 0, color: '#7F1D1D', fontSize: '16px', fontWeight: '600' }}>
              Risk Monitoring
            </h4>
          </div>
          <p style={{ color: '#B91C1C', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            Real-time pest risk assessment and early warning alerts based on satellite data and environmental conditions.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1px solid #FCD34D',
          padding: '1.5rem',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Beaker style={{ color: '#D97706', width: '24px', height: '24px' }} />
            <h4 style={{ margin: 0, color: '#92400E', fontSize: '16px', fontWeight: '600' }}>
              Soil Testing
            </h4>
          </div>
          <p style={{ color: '#B45309', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
            Comprehensive soil fertility analysis with nutrient recommendations and health trend monitoring.
          </p>
        </div>
      </div>

      {/* System Status */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} />
          System Status
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: overviewData.cropHealth ? '#10B981' : '#EF4444' }}></div>
            <span style={{ fontSize: '14px', color: '#374151' }}>Crop Health Module</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: overviewData.pestRisk ? '#10B981' : '#EF4444' }}></div>
            <span style={{ fontSize: '14px', color: '#374151' }}>Pest Detection Module</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: overviewData.soilAnalysis ? '#10B981' : '#EF4444' }}></div>
            <span style={{ fontSize: '14px', color: '#374151' }}>Soil Analysis Module</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: overviewData.recentStats.length > 0 ? '#10B981' : '#EF4444' }}></div>
            <span style={{ fontSize: '14px', color: '#374151' }}>Satellite Data Feed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;                 