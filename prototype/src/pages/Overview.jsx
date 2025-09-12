import React from "react";
import { Leaf, Mountain, Bug, Map, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { healthData, soilData } from "../data/mockData";

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
              <Line
                type="monotone"
                dataKey="ndvi"
                stroke="#10b981"
                name="NDVI"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#f59e0b"
                name="Stress Level"
                strokeWidth={2}
              />
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
              <p className="alert-description">
                Zone B shows elevated aphid activity. Recommend immediate
                inspection.
              </p>
            </div>
            <span className="alert-time">2 hours ago</span>
          </div>

          <div className="alert-item yellow">
            <AlertTriangle className="alert-icon" />
            <div className="alert-content">
              <p className="alert-title">Low Soil Moisture</p>
              <p className="alert-description">
                Zone D moisture levels below optimal range for corn growth.
              </p>
            </div>
            <span className="alert-time">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;