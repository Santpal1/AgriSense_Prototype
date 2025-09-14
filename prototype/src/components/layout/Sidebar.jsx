import React from "react";
import { 
  TrendingUp, 
  Leaf, 
  Mountain, 
  Bug, 
  Map, 
  Settings 
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "crop-health", label: "Crop Health", icon: Leaf },
    { id: "soil-analysis", label: "Soil Analysis", icon: Mountain },
    { id: "pest-detection", label: "Pest Detection", icon: Bug },
    { id: "field-map", label: "Field Map", icon: Map },
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
                  className={`nav-item ${
                    activeTab === item.id ? "active" : ""
                  }`}
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

export default Sidebar;