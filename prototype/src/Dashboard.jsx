import React, { useState } from 'react';
import {
    Leaf,
    Mountain,
    Bug,
    Map,
    TrendingUp,
    AlertTriangle,
    Settings,
    Bell,
    Calendar,
    Download,
    Search,
    Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import './Dashboard.css';

// Mock data
const healthData = [
    { time: '00:00', ndvi: 0.7, stress: 0.2, disease: 0.1 },
    { time: '04:00', ndvi: 0.72, stress: 0.15, disease: 0.1 },
    { time: '08:00', ndvi: 0.75, stress: 0.1, disease: 0.05 },
    { time: '12:00', ndvi: 0.73, stress: 0.25, disease: 0.15 },
    { time: '16:00', ndvi: 0.71, stress: 0.3, disease: 0.2 },
    { time: '20:00', ndvi: 0.69, stress: 0.25, disease: 0.15 }
];

const soilData = [
    { zone: 'Zone A', moisture: 45, temperature: 22, ph: 6.8, nitrogen: 78 },
    { zone: 'Zone B', moisture: 38, temperature: 24, ph: 7.2, nitrogen: 65 },
    { zone: 'Zone C', moisture: 52, temperature: 20, ph: 6.5, nitrogen: 82 },
    { zone: 'Zone D', moisture: 41, temperature: 23, ph: 7.0, nitrogen: 71 }
];

const pestRiskData = [
    { pest: 'Aphids', risk: 75, trend: '+12%' },
    { pest: 'Spider Mites', risk: 45, trend: '-5%' },
    { pest: 'Cutworms', risk: 60, trend: '+8%' },
    { pest: 'Thrips', risk: 30, trend: '-15%' }
];

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'crop-health', label: 'Crop Health', icon: Leaf },
        { id: 'soil-analysis', label: 'Soil Analysis', icon: Mountain },
        { id: 'pest-detection', label: 'Pest Detection', icon: Bug },
        { id: 'field-map', label: 'Field Map', icon: Map },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1 className="app-title">AgriSense AI</h1>
                <p className="app-subtitle">Smart Crop Monitoring</p>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                >
                                    <Icon className="nav-icon" />
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

// Header Component
const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h2 className="page-title">Farm Dashboard</h2>
                    <div className="last-updated">
                        <Calendar className="icon-small" />
                        <span>Last updated: 5 minutes ago</span>
                    </div>
                </div>

                <div className="header-right">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search fields..."
                            className="search-input"
                        />
                    </div>
                    <button className="header-btn">
                        <Filter className="icon" />
                    </button>
                    <button className="header-btn notification-btn">
                        <Bell className="icon" />
                        <span className="notification-badge">3</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

// Overview Component
const Overview = () => {
    return (
        <div className="content-section">
            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-content">
                        <div className="metric-info">
                            <p className="metric-label">Overall Health</p>
                            <p className="metric-value green">87%</p>
                            <p className="metric-change positive">+5% from last week</p>
                        </div>
                        <Leaf className="metric-icon green" />
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-content">
                        <div className="metric-info">
                            <p className="metric-label">Soil Quality</p>
                            <p className="metric-value blue">92%</p>
                            <p className="metric-change positive">+2% from last week</p>
                        </div>
                        <Mountain className="metric-icon blue" />
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-content">
                        <div className="metric-info">
                            <p className="metric-label">Pest Risk</p>
                            <p className="metric-value orange">Medium</p>
                            <p className="metric-change neutral">2 alerts active</p>
                        </div>
                        <Bug className="metric-icon orange" />
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-content">
                        <div className="metric-info">
                            <p className="metric-label">Fields Monitored</p>
                            <p className="metric-value purple">12</p>
                            <p className="metric-change neutral">450 hectares</p>
                        </div>
                        <Map className="metric-icon purple" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="chart-title">Crop Health Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={healthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="ndvi" stroke="#10b981" name="NDVI" strokeWidth={2} />
                            <Line type="monotone" dataKey="stress" stroke="#f59e0b" name="Stress Level" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title">Soil Conditions by Zone</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={soilData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="zone" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="moisture" fill="#3b82f6" name="Moisture %" />
                            <Bar dataKey="nitrogen" fill="#10b981" name="Nitrogen Level" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alerts */}
            <div className="alerts-card">
                <h3 className="section-title">Active Alerts</h3>
                <div className="alerts-list">
                    <div className="alert-item orange">
                        <AlertTriangle className="alert-icon" />
                        <div className="alert-content">
                            <p className="alert-title">High Pest Risk Detected</p>
                            <p className="alert-description">Zone B shows elevated aphid activity. Recommend immediate inspection.</p>
                        </div>
                        <span className="alert-time">2 hours ago</span>
                    </div>

                    <div className="alert-item yellow">
                        <AlertTriangle className="alert-icon" />
                        <div className="alert-content">
                            <p className="alert-title">Low Soil Moisture</p>
                            <p className="alert-description">Zone D moisture levels below optimal range for corn growth.</p>
                        </div>
                        <span className="alert-time">6 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Crop Health Component
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
                    {Array.from({length: 20}).map((_, i) => (
                        <div key={i} className={`health-point ${
                            i % 3 === 0 ? 'critical' : i % 3 === 1 ? 'warning' : 'healthy'
                        }`} style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`
                        }} />
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
                    <div className="index-description">Normalized Difference Vegetation Index</div>
                    <div className="progress-bar">
                        <div className="progress-fill green" style={{width: '73%'}}></div>
                    </div>
                </div>

                <div className="index-card">
                    <h4 className="index-title">SAVI Analysis</h4>
                    <div className="index-value blue">0.68</div>
                    <div className="index-description">Soil Adjusted Vegetation Index</div>
                    <div className="progress-bar">
                        <div className="progress-fill blue" style={{width: '68%'}}></div>
                    </div>
                </div>

                <div className="index-card">
                    <h4 className="index-title">EVI Analysis</h4>
                    <div className="index-value purple">0.71</div>
                    <div className="index-description">Enhanced Vegetation Index</div>
                    <div className="progress-bar">
                        <div className="progress-fill purple" style={{width: '71%'}}></div>
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
                        <Area type="monotone" dataKey="ndvi" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="stress" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="disease" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Soil Analysis Component
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
                        <div className="progress-fill blue" style={{width: '44%'}}></div>
                    </div>
                </div>

                <div className="metric-card">
                    <h4 className="soil-metric-title red">Temperature</h4>
                    <div className="soil-metric-value">22.3°C</div>
                    <div className="soil-metric-desc">Surface temperature</div>
                    <div className="progress-bar">
                        <div className="progress-fill red" style={{width: '60%'}}></div>
                    </div>
                </div>

                <div className="metric-card">
                    <h4 className="soil-metric-title green">pH Level</h4>
                    <div className="soil-metric-value">6.9</div>
                    <div className="soil-metric-desc">Slightly acidic</div>
                    <div className="progress-bar">
                        <div className="progress-fill green" style={{width: '69%'}}></div>
                    </div>
                </div>

                <div className="metric-card">
                    <h4 className="soil-metric-title purple">Nitrogen</h4>
                    <div className="soil-metric-value">74</div>
                    <div className="soil-metric-desc">ppm average</div>
                    <div className="progress-bar">
                        <div className="progress-fill purple" style={{width: '74%'}}></div>
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

// Pest Detection Component
const PestDetection = () => {
    return (
        <div className="content-section">
            <div className="section-header">
                <h2 className="page-title">Pest Detection & Risk Assessment</h2>
                <button className="btn primary orange">
                    <AlertTriangle className="btn-icon" />
                    Generate Alert
                </button>
            </div>

            {/* Risk Overview */}
            <div className="risk-grid">
                <div className="risk-card high">
                    <h4 className="risk-title">High Risk</h4>
                    <div className="risk-value">3</div>
                    <div className="risk-description">Zones requiring attention</div>
                </div>

                <div className="risk-card medium">
                    <h4 className="risk-title">Medium Risk</h4>
                    <div className="risk-value">5</div>
                    <div className="risk-description">Zones under monitoring</div>
                </div>

                <div className="risk-card low">
                    <h4 className="risk-title">Low Risk</h4>
                    <div className="risk-value">4</div>
                    <div className="risk-description">Zones in good condition</div>
                </div>
            </div>

            {/* Pest Risk Table */}
            <div className="table-card">
                <h3 className="section-title">Pest Risk Assessment</h3>
                <div className="table-container">
                    <table className="pest-table">
                        <thead>
                        <tr>
                            <th>Pest Type</th>
                            <th>Risk Level</th>
                            <th>Trend</th>
                            <th>Affected Zones</th>
                            <th>Action Required</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pestRiskData.map((pest, i) => (
                            <tr key={i}>
                                <td className="pest-name">{pest.pest}</td>
                                <td>
                                    <div className="risk-indicator">
                                        <div className={`risk-dot ${
                                            pest.risk > 60 ? 'high' : pest.risk > 40 ? 'medium' : 'low'
                                        }`}></div>
                                        {pest.risk}%
                                    </div>
                                </td>
                                <td className={`trend ${pest.trend.includes('+') ? 'negative' : 'positive'}`}>
                                    {pest.trend}
                                </td>
                                <td>Zone A, B</td>
                                <td>
                                    <button className="action-btn">Monitor</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Model Performance */}
            <div className="model-performance-card">
                <h3 className="section-title">AI Model Performance</h3>
                <div className="performance-grid">
                    <div className="performance-item green">
                        <div className="performance-value">94.2%</div>
                        <div className="performance-label">CNN Accuracy</div>
                        <div className="performance-desc">Image Classification</div>
                    </div>
                    <div className="performance-item blue">
                        <div className="performance-value">91.8%</div>
                        <div className="performance-label">LSTM Accuracy</div>
                        <div className="performance-desc">Temporal Prediction</div>
                    </div>
                    <div className="performance-item purple">
                        <div className="performance-value">87.5%</div>
                        <div className="performance-label">Ensemble Model</div>
                        <div className="performance-desc">Combined Analysis</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Field Map Component
const FieldMap = () => {
    return (
        <div className="content-section">
            <h2 className="page-title">Field Mapping & Monitoring</h2>

            {/* Map Interface */}
            <div className="map-card">
                <div className="map-header">
                    <h3 className="section-title">Interactive Field Map</h3>
                    <div className="map-controls">
                        <button className="map-btn">Satellite</button>
                        <button className="map-btn active">Health View</button>
                        <button className="map-btn">Thermal</button>
                    </div>
                </div>

                {/* Simulated Map */}
                <div className="field-map">
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
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="sensor-point" style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${20 + Math.random() * 60}%`
                        }}>
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

// Settings Component
const SettingsPanel = () => {
    return (
        <div className="content-section">
            <h2 className="page-title">Platform Settings</h2>

            <div className="settings-grid">
                <div className="settings-card">
                    <h3 className="section-title">Model Configuration</h3>
                    <div className="settings-form">
                        <div className="form-group">
                            <label className="form-label">CNN Model Sensitivity</label>
                            <input type="range" min="0" max="100" defaultValue="85" className="slider" />
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
                            <input type="range" min="0" max="100" defaultValue="70" className="slider" />
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

// Main App Component
const AgriDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview />;
            case 'crop-health':
                return <CropHealth />;
            case 'soil-analysis':
                return <SoilAnalysis />;
            case 'pest-detection':
                return <PestDetection />;
            case 'field-map':
                return <FieldMap />;
            case 'settings':
                return <SettingsPanel />;
            default:
                return <Overview />;
        }
    };

    return (
        <div className="dashboard">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="main-content">
                <Header />

                <main className="content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AgriDashboard;