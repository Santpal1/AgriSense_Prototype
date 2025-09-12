import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Overview from "./pages/Overview";
import CropHealth from "./pages/CropHealth";
import SoilAnalysis from "./pages/SoilAnalysis";
import PestDetection from "./pages/PestDetection";
import FieldMap from "./pages/FieldMap";
import Settings from "./pages/Settings";
import "./styles/index.css";

const AgriDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "crop-health":
        return <CropHealth />;
      case "soil-analysis":
        return <SoilAnalysis />;
      case "pest-detection":
        return <PestDetection />;
      case "field-map":
        return <FieldMap />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Header />

        <main className="content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AgriDashboard;