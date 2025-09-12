import React from "react";
import { AlertTriangle } from "lucide-react";
import { pestRiskData } from "../data/mockData";

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
                      <div
                        className={`risk-dot ${
                          pest.risk > 60
                            ? "high"
                            : pest.risk > 40
                            ? "medium"
                            : "low"
                        }`}
                      ></div>
                      {pest.risk}%
                    </div>
                  </td>
                  <td
                    className={`trend ${
                      pest.trend.includes("+") ? "negative" : "positive"
                    }`}
                  >
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
    </div>
  );
};

export default PestDetection;