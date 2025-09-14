import React, { useEffect, useState } from "react";
import { Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Droplets, Thermometer, Activity, BarChart3, Beaker, Send, RefreshCw } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar 
} from "recharts";
const API_BASE = import.meta.env.VITE_API_URL;

const SoilAnalysis = () => {
  const [soilData, setSoilData] = useState([]);
  const [cropStats, setCropStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thresholds, setThresholds] = useState({ poor: 300, moderate: 700 });

  // Hardcoded soil fertility values
  const hardcodedFertilityData = {
    N: 280,
    P: 15,
    K: 200,
    pH: 6.5,
    EC: 0.8,
    OC: 0.75,
    S: 12,
    Zn: 1.2,
    Fe: 8.5,
    Cu: 2.8,
    Mn: 15,
    B: 0.6
  };

  // State for fertility result
  const [fertilityResult, setFertilityResult] = useState(null);

  // Fetch fertility prediction once on mount
  useEffect(() => {
    const fetchFertility = async () => {
      try {
        const response = await fetch(`${API_BASE}/predict/soil-fertility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardcodedFertilityData)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze soil fertility');
        }
        const result = await response.json();
        setFertilityResult(result);
      } catch (err) {
        setFertilityResult({ error: err.message });
      }
    };
    fetchFertility();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch soil health data with configurable thresholds
        const soilRes = await fetch(
          `${API_BASE}/predict/soil-health?limit=5&poor=${thresholds.poor}&moderate=${thresholds.moderate}`
        );
        if (!soilRes.ok) throw new Error("Failed to fetch soil data");
        const soilData = await soilRes.json();
        setSoilData(Array.isArray(soilData) ? soilData : [soilData]);

        // Fetch recent crop stats for additional soil indicators
        const statsRes = await fetch(`${API_BASE}/recent-crop-stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setCropStats(statsData);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [thresholds.poor, thresholds.moderate]);

  const updateThresholds = (poor, moderate) => {
    setThresholds({ poor, moderate });
  };

  const getFertilityColor = (label) => {
    switch (label) {
      case "High Fertility": return "#10b981";
      case "Medium Fertility": return "#f59e0b";
      case "Low Fertility": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getFertilityIcon = (label) => {
    switch (label) {
      case "High Fertility": return <CheckCircle style={{ width: '24px', height: '24px', color: '#10b981' }} />;
      case "Medium Fertility": return <AlertTriangle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />;
      case "Low Fertility": return <AlertTriangle style={{ width: '24px', height: '24px', color: '#ef4444' }} />;
      default: return <Activity style={{ width: '24px', height: '24px', color: '#6b7280' }} />;
    }
  };

  const getHealthColor = (classification) => {
    switch (classification) {
      case "healthy": return "#10b981";
      case "moderate": return "#f59e0b";
      case "poor": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getHealthIcon = (classification) => {
    switch (classification) {
      case "healthy": return <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />;
      case "moderate": return <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />;
      case "poor": return <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
      default: return <Activity style={{ width: '20px', height: '20px', color: '#6b7280' }} />;
    }
  };

  const calculateTrend = () => {
    if (soilData.length < 2) return { direction: "stable", percentage: 0 };
    
    const latest = soilData[soilData.length - 1];
    const previous = soilData[soilData.length - 2];
    const change = ((latest.soil_health_index - previous.soil_health_index) / previous.soil_health_index) * 100;
    
    return {
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const prepareSoilTrendData = () => {
    return soilData.map((item, index) => ({
      day: `Day ${index + 1}`,
      index: item.soil_health_index,
      classification: item.soil_health_class,
      timestamp: new Date(item.timestamp).toLocaleDateString()
    }));
  };

  // Normalize indicators for chart
  const normalizeIndicator = (name, value) => {
    if (["NDVI", "NDWI", "NDSI"].includes(name)) {
      return (value + 1) / 2;
    }
    if (name === "SWIR") {
      return Math.max(0, Math.min(1, value / 10000));
    }
    return value;
  };

  // Prepare normalized indicator data for bar chart
  const prepareNormalizedIndicatorData = () => {
    if (cropStats.length === 0) return [];
    const latest = cropStats[cropStats.length - 1];
    return [
      { name: "NDVI", value: normalizeIndicator("NDVI", latest.indices.NDVI.mean), raw: latest.indices.NDVI.mean, color: "#10b981", unit: "" },
      { name: "NDWI", value: normalizeIndicator("NDWI", latest.indices.NDWI.mean), raw: latest.indices.NDWI.mean, color: "#3b82f6", unit: "" },
      { name: "SWIR", value: normalizeIndicator("SWIR", latest.indices.SWIR.mean), raw: latest.indices.SWIR.mean, color: "#f59e0b", unit: "" },
      { name: "NDSI", value: normalizeIndicator("NDSI", latest.indices.NDSI.mean), raw: latest.indices.NDSI.mean, color: "#8b5cf6", unit: "" }
    ];
  };

  // Prepare normalized time series for NDVI, NDWI, SWIR, NDSI
  const prepareNormalizedIndexTrendData = () => {
    return cropStats.map((item, idx) => ({
      day: `Day ${idx + 1}`,
      NDVI: normalizeIndicator("NDVI", item.indices.NDVI.mean),
      NDWI: normalizeIndicator("NDWI", item.indices.NDWI.mean),
      SWIR: normalizeIndicator("SWIR", item.indices.SWIR.mean),
      NDSI: normalizeIndicator("NDSI", item.indices.NDSI.mean),
      timestamp: new Date(item.timestamp).toLocaleDateString()
    }));
  };

  const trend = calculateTrend();
  const currentHealth = soilData.length > 0 ? soilData[soilData.length - 1] : null;
  const indicatorData = prepareNormalizedIndicatorData();
  const indexTrendData = prepareNormalizedIndexTrendData();

  // Prepare fertility data for charts
  const fertilityChartData = [
    { name: 'N', value: hardcodedFertilityData.N, color: '#3b82f6' },
    { name: 'P', value: hardcodedFertilityData.P, color: '#10b981' },
    { name: 'K', value: hardcodedFertilityData.K, color: '#f59e0b' },
    { name: 'S', value: hardcodedFertilityData.S, color: '#8b5cf6' },
    { name: 'Zn', value: hardcodedFertilityData.Zn, color: '#6366f1' },
    { name: 'Fe', value: hardcodedFertilityData.Fe, color: '#ef4444' },
    { name: 'Cu', value: hardcodedFertilityData.Cu, color: '#a3e635' },
    { name: 'Mn', value: hardcodedFertilityData.Mn, color: '#f472b6' },
    { name: 'B', value: hardcodedFertilityData.B, color: '#fbbf24' }
  ];

  const fertilityPieData = [
    { name: 'N', value: hardcodedFertilityData.N, color: '#3b82f6' },
    { name: 'P', value: hardcodedFertilityData.P, color: '#10b981' },
    { name: 'K', value: hardcodedFertilityData.K, color: '#f59e0b' }
  ];

  if (loading) {
    return (
      <div className="content-section">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '256px' 
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid #f3f4f6', 
            borderTop: '3px solid #2563eb', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
        </div>
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
      <div className="content-section">
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444', marginRight: '8px' }} />
            <span style={{ color: '#b91c1c' }}>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '16px'
    },
    headerContent: {
      flex: 1
    },
    pageTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    pageSubtitle: {
      color: '#6b7280',
      marginTop: '4px',
      fontSize: '14px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px'
    },
    thresholdControls: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px'
    },
    thresholdTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '12px'
    },
    thresholdGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    inputLabel: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      fontSize: '14px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    metricCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    metricCardBlue: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      borderColor: '#93c5fd'
    },
    metricCardGreen: {
      background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
      borderColor: '#86efac'
    },
    metricCardYellow: {
      background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
      borderColor: '#fcd34d'
    },
    metricCardPurple: {
      background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
      borderColor: '#c4b5fd'
    },
    metricHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    metricTitle: {
      fontSize: '14px',
      fontWeight: '500'
    },
    metricValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    metricDescription: {
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px'
    },
    chartCard: {
      background: 'rgba(255,255,255,0.7)',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '32px 24px 24px 24px',
      boxShadow: '0 8px 32px rgba(60, 60, 120, 0.12)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      overflow: 'visible'
    },
    chartLegend: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24px',
      position: 'absolute',
      top: '12px',
      left: 0,
      width: '100%',
      zIndex: 2,
      fontSize: '13px',
      fontWeight: 500,
      background: 'rgba(255,255,255,0.6)',
      borderRadius: '12px',
      padding: '6px 0',
      boxShadow: '0 2px 8px rgba(60,60,120,0.07)'
    },
    barLegend: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24px',
      marginBottom: '8px',
      fontSize: '13px',
      fontWeight: 500,
      background: 'rgba(255,255,255,0.6)',
      borderRadius: '12px',
      padding: '6px 0',
      boxShadow: '0 2px 8px rgba(60,60,120,0.07)'
    },
    table: {
      width: '100%',
      fontSize: '14px',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      position: 'sticky',
      top: 0
    },
    tableHeaderCell: {
      padding: '8px 16px',
      textAlign: 'left',
      fontWeight: '500',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb'
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s'
    },
    tableCell: {
      padding: '12px 16px',
      color: '#1f2937'
    },
    tableCellBold: {
      padding: '12px 16px',
      color: '#1f2937',
      fontWeight: '500'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    recommendationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px'
    },
    recommendationCard: {
      borderRadius: '8px',
      padding: '16px',
      border: '1px solid'
    },
    recommendationHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      gap: '8px'
    },
    recommendationTitle: {
      fontWeight: '500'
    },
    recommendationText: {
      fontSize: '14px'
    },
    // Fertility testing styles
    fertilitySection: {
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      border: '1px solid #bae6fd',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)'
    },
    fertilityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    fertilityTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '20px',
      fontWeight: '600',
      color: '#1e40af',
      margin: 0
    },
    fertilityFormGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    },
    fertilityInputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    fertilityLabel: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151'
    },
    fertilityInput: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.2s',
      outline: 'none'
    },
    fertilityActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginBottom: '20px'
    },
    btnPrimary: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      outline: 'none'
    },
    btnSecondary: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      outline: 'none'
    },
    fertilityResultCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    fertilityResultHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px'
    },
    fertilityResultTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    fertilityResultValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    errorCard: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px'
    },
    errorText: {
      color: '#b91c1c',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <div className="content-section" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.pageTitle}>Soil Health Analysis</h2>
          <p style={styles.pageSubtitle}>Comprehensive soil monitoring and health assessment</p>
        </div>
        <button
          className="btn primary blue"
          onClick={() => {
            const exportData = {
              soil_health: soilData,
              crop_indicators: cropStats,
              fertility_result: fertilityResult,
              thresholds: thresholds,
              analysis_date: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `soil_analysis_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
          }}
        >
          <Download className="btn-icon" />
          Export Analysis
        </button>
      </div>

      {/* Soil Fertility Display (no user input, just hardcoded values and prediction) */}
      <div style={styles.fertilitySection}>
        <div style={styles.fertilityHeader}>
          <h3 style={styles.fertilityTitle}>
            <Beaker />
            Soil Fertility Analysis
          </h3>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>
            Parameters
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {[
              { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha' },
              { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha' },
              { key: 'K', label: 'Potassium (K)', unit: 'kg/ha' },
              { key: 'pH', label: 'pH Level', unit: '' },
              { key: 'EC', label: 'Electrical Conductivity (EC)', unit: 'dS/m' },
              { key: 'OC', label: 'Organic Carbon (OC)', unit: '%' },
              { key: 'S', label: 'Sulfur (S)', unit: 'mg/kg' },
              { key: 'Zn', label: 'Zinc (Zn)', unit: 'mg/kg' },
              { key: 'Fe', label: 'Iron (Fe)', unit: 'mg/kg' },
              { key: 'Cu', label: 'Copper (Cu)', unit: 'mg/kg' },
              { key: 'Mn', label: 'Manganese (Mn)', unit: 'mg/kg' },
              { key: 'B', label: 'Boron (B)', unit: 'mg/kg' }
            ].map(param => (
              <div key={param.key} style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                color: '#374151',
                fontWeight: 500
              }}>
                <span style={{ color: '#2563eb', fontWeight: 600 }}>{param.label}</span>
                <br />
                <span style={{ color: '#1e293b', fontWeight: 700 }}>{hardcodedFertilityData[param.key]}</span>
                {param.unit && <span style={{ color: '#64748b', marginLeft: '4px' }}>{param.unit}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Fertility Bar Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
            Macro & Micro Nutrients (Bar Chart)
          </h4>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fertilityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="value">
                  {fertilityChartData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fertility Pie Chart */}
        <div style={{
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(59,130,246,0.08)'
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
            NPK Distribution (Pie Chart)
          </h4>
          <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="80%" height="100%">
              <PieChart>
                <Pie
                  data={fertilityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {fertilityPieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {fertilityResult && !fertilityResult.error && (
          <div style={{
            ...styles.fertilityResultCard,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd'
          }}>
            <div style={styles.fertilityResultHeader}>
              {getFertilityIcon(fertilityResult.fertility_label)}
              <h4 style={styles.fertilityResultTitle}>Fertility Analysis Results</h4>
            </div>
            <div style={{
              ...styles.fertilityResultValue,
              color: getFertilityColor(fertilityResult.fertility_label),
              textShadow: '0 2px 8px #bae6fd'
            }}>
              {fertilityResult.fertility_label}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '16px'
            }}>
              Prediction Score: {fertilityResult.prediction}
            </div>
            {/* Fertility Recommendations */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '12px',
              boxShadow: '0 2px 8px rgba(59,130,246,0.07)'
            }}>
              <h5 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px', fontWeight: '600' }}>
                Recommendations
              </h5>
              {fertilityResult.fertility_label === "Low Fertility" && (
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>Apply nitrogen-rich fertilizers (NPK 20-10-10)</li>
                  <li>Add organic compost to improve soil structure</li>
                  <li>Consider lime application if pH is below 6.0</li>
                  <li>Test and supplement micronutrients (Zn, Fe, Mn)</li>
                  <li>Implement crop rotation with nitrogen-fixing legumes</li>
                </ul>
              )}
              {fertilityResult.fertility_label === "Medium Fertility" && (
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>Apply balanced fertilizers (NPK 15-15-15)</li>
                  <li>Monitor and maintain optimal pH levels (6.0-7.0)</li>
                  <li>Continue organic matter addition</li>
                  <li>Regular soil testing every 6 months</li>
                  <li>Consider precision fertilizer application</li>
                </ul>
              )}
              {fertilityResult.fertility_label === "High Fertility" && (
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
                  <li>Maintain current nutrient management practices</li>
                  <li>Focus on micronutrient balance</li>
                  <li>Implement precision agriculture techniques</li>
                  <li>Monitor for potential nutrient excess</li>
                  <li>Annual soil testing to track changes</li>
                </ul>
              )}
            </div>
          </div>
        )}
        {fertilityResult && fertilityResult.error && (
          <div style={styles.errorCard}>
            <div style={styles.errorText}>
              <AlertTriangle style={{ width: '16px', height: '16px' }} />
              {fertilityResult.error}
            </div>
          </div>
        )}
      </div>

      {/* Threshold Controls */}
      <div style={styles.thresholdControls}>
        <h3 style={styles.thresholdTitle}>Satellite Data Classification Thresholds</h3>
        <div style={styles.thresholdGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Poor Threshold</label>
            <input
              type="number"
              value={thresholds.poor}
              onChange={(e) => updateThresholds(Number(e.target.value), thresholds.moderate)}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Moderate Threshold</label>
            <input
              type="number"
              value={thresholds.moderate}
              onChange={(e) => updateThresholds(thresholds.poor, Number(e.target.value))}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        {currentHealth && (
          <>
            <div style={{...styles.metricCard, ...styles.metricCardBlue}}>
              <div style={styles.metricHeader}>
                <h4 style={{...styles.metricTitle, color: '#1d4ed8'}}>Soil Health Index</h4>
                <Activity style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              </div>
              <div style={{...styles.metricValue, color: '#1e3a8a'}}>
                {currentHealth.soil_health_index}
              </div>
              <div style={{...styles.metricDescription, color: '#1d4ed8'}}>
                {getHealthIcon(currentHealth.soil_health_class)}
                <span style={{ textTransform: 'capitalize' }}>{currentHealth.soil_health_class}</span>
              </div>
            </div>

            <div style={{...styles.metricCard, ...styles.metricCardGreen}}>
              <div style={styles.metricHeader}>
                <h4 style={{...styles.metricTitle, color: '#047857'}}>Trend</h4>
                {trend.direction === "up" ? (
                  <TrendingUp style={{ width: '20px', height: '20px', color: '#059669' }} />
                ) : trend.direction === "down" ? (
                  <TrendingDown style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                ) : (
                  <Activity style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                )}
              </div>
              <div style={{...styles.metricValue, color: '#064e3b'}}>
                {trend.percentage}%
              </div>
              <div style={{...styles.metricDescription, color: '#047857', textTransform: 'capitalize'}}>
                {trend.direction === "stable" ? "Stable" : `${trend.direction}ward trend`}
              </div>
            </div>

            <div style={{...styles.metricCard, ...styles.metricCardYellow}}>
              <div style={styles.metricHeader}>
                <h4 style={{...styles.metricTitle, color: '#b45309'}}>Last Updated</h4>
                <Thermometer style={{ width: '20px', height: '20px', color: '#d97706' }} />
              </div>
              <div style={{...styles.metricValue, color: '#92400e', fontSize: '20px'}}>
                {new Date(currentHealth.timestamp).toLocaleDateString()}
              </div>
              <div style={{...styles.metricDescription, color: '#b45309'}}>
                {new Date(currentHealth.timestamp).toLocaleTimeString()}
              </div>
            </div>

            <div style={{...styles.metricCard, ...styles.metricCardPurple}}>
              <div style={styles.metricHeader}>
                <h4 style={{...styles.metricTitle, color: '#7c3aed'}}>Data Points</h4>
                <BarChart3 style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
              </div>
              <div style={{...styles.metricValue, color: '#5b21b6'}}>
                {soilData.length}
              </div>
              <div style={{...styles.metricDescription, color: '#7c3aed'}}>
                Records analyzed
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Soil Health Trend */}
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Soil Health Trend</h3>
          <div style={{ height: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prepareSoilTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="index" 
                  stroke="#3b82f6" 
                  fill="url(#soilGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Index Trends Over Time (Normalized) */}
        <div style={styles.chartCard}>
          <div style={styles.chartLegend}>
            <span style={{ color: '#10b981' }}>● NDVI</span>
            <span style={{ color: '#3b82f6' }}>● NDWI</span>
            <span style={{ color: '#f59e0b' }}>● SWIR</span>
            <span style={{ color: '#8b5cf6' }}>● NDSI</span>
          </div>
          <h3 style={styles.sectionTitle}>Index Trends Over Time (Normalized)</h3>
          <div style={{ height: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indexTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value, name) => [`${(value * 100).toFixed(1)}%`, name]} />
                <Line type="monotone" dataKey="NDVI" stroke="#10b981" strokeWidth={3} dot={true} name="NDVI" />
                <Line type="monotone" dataKey="NDWI" stroke="#3b82f6" strokeWidth={3} dot={true} name="NDWI" />
                <Line type="monotone" dataKey="SWIR" stroke="#f59e0b" strokeWidth={3} dot={true} name="SWIR" />
                <Line type="monotone" dataKey="NDSI" stroke="#8b5cf6" strokeWidth={3} dot={true} name="NDSI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Soil Indicators (Normalized Bar Chart) */}
        {indicatorData.length > 0 && (
          <div style={styles.chartCard}>
            <div style={styles.barLegend}>
              {indicatorData.map((entry) => (
                <span key={entry.name} style={{ color: entry.color }}>
                  ● {entry.name} <span style={{ color: '#64748b', fontWeight: 400 }}>({entry.raw.toFixed(3)})</span>
                </span>
              ))}
            </div>
            <h3 style={styles.sectionTitle}>Current Soil Indicators (Normalized)</h3>
            <div style={{ height: '256px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={indicatorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value, name, props) => [`${(value * 100).toFixed(1)}%`, `Normalized`]} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {indicatorData.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed History Table */}
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Historical Records</h3>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ maxHeight: '256px', overflowY: 'auto' }}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.tableHeaderCell}>Date</th>
                    <th style={styles.tableHeaderCell}>Index</th>
                    <th style={styles.tableHeaderCell}>Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {soilData.map((row, idx) => (
                    <tr
                      key={idx}
                      style={styles.tableRow}
                      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(90deg, #e0e7ff 0%, #f0fdf4 100%)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={styles.tableCell}>
                        {new Date(row.timestamp).toLocaleDateString()}
                      </td>
                      <td style={styles.tableCellBold}>
                        {row.soil_health_index}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={{
                          ...styles.badge,
                          backgroundColor: `${getHealthColor(row.soil_health_class)}20`,
                          color: getHealthColor(row.soil_health_class)
                        }}>
                          {getHealthIcon(row.soil_health_class)}
                          {row.soil_health_class}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {currentHealth && (
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Soil Health Recommendations</h3>
          <div style={styles.recommendationsGrid}>
            {currentHealth.soil_health_class === "poor" && (
              <>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#fef2f2',
                  borderColor: '#fecaca'
                }}>
                  <div style={styles.recommendationHeader}>
                    <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#991b1b'}}>Immediate Action</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#b91c1c'}}>
                    Apply organic compost and improve drainage. Consider soil testing for specific nutrient deficiencies.
                  </p>
                </div>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#fffbeb',
                  borderColor: '#fed7aa'
                }}>
                  <div style={styles.recommendationHeader}>
                    <Droplets style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#92400e'}}>Water Management</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#b45309'}}>
                    Implement controlled irrigation to prevent waterlogging and improve soil structure.
                  </p>
                </div>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe'
                }}>
                  <div style={styles.recommendationHeader}>
                    <Activity style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#1e40af'}}>Monitoring</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#1d4ed8'}}>
                    Increase monitoring frequency to daily checks until soil health improves.
                  </p>
                </div>
              </>
            )}
            
            {currentHealth.soil_health_class === "moderate" && (
              <>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#fffbeb',
                  borderColor: '#fed7aa'
                }}>
                  <div style={styles.recommendationHeader}>
                    <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#92400e'}}>Preventive Care</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#b45309'}}>
                    Apply balanced fertilizer and maintain consistent watering schedule. Monitor for improvements.
                  </p>
                </div>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#f0fdf4',
                  borderColor: '#bbf7d0'
                }}>
                  <div style={styles.recommendationHeader}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#047857'}}>Soil Enhancement</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#059669'}}>
                    Add organic matter to improve soil structure and nutrient retention capacity.
                  </p>
                </div>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe'
                }}>
                  <div style={styles.recommendationHeader}>
                    <Activity style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#1e40af'}}>Regular Monitoring</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#1d4ed8'}}>
                    Continue regular monitoring to ensure soil health maintains upward trend.
                  </p>
                </div>
              </>
            )}
            
            {currentHealth.soil_health_class === "healthy" && (
              <>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#f0fdf4',
                  borderColor: '#bbf7d0'
                }}>
                  <div style={styles.recommendationHeader}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#047857'}}>Maintain Excellence</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#059669'}}>
                    Continue current management practices. Soil health is optimal for crop growth.
                  </p>
                </div>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#eff6ff',
                  borderColor: '#bfdbfe'
                }}>
                  <div style={styles.recommendationHeader}>
                    <Activity style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#1e40af'}}>Optimization</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#1d4ed8'}}>
                    Consider precision farming techniques to maximize yield potential and efficiency.
                  </p>
                </div>
                <div style={{
                  ...styles.recommendationCard,
                  backgroundColor: '#faf5ff',
                  borderColor: '#e9d5ff'
                }}>
                  <div style={styles.recommendationHeader}>
                    <BarChart3 style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                    <h4 style={{...styles.recommendationTitle, color: '#7c2d12'}}>Data Collection</h4>
                  </div>
                  <p style={{...styles.recommendationText, color: '#8b5cf6'}}>
                    Maintain regular monitoring to establish baseline patterns for future analysis.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilAnalysis;