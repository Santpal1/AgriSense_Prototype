// Mock data for the AgriSense AI dashboard
export const healthData = [
  { time: "00:00", ndvi: 0.7, stress: 0.2, disease: 0.1 },
  { time: "04:00", ndvi: 0.72, stress: 0.15, disease: 0.1 },
  { time: "08:00", ndvi: 0.75, stress: 0.1, disease: 0.05 },
  { time: "12:00", ndvi: 0.73, stress: 0.25, disease: 0.15 },
  { time: "16:00", ndvi: 0.71, stress: 0.3, disease: 0.2 },
  { time: "20:00", ndvi: 0.69, stress: 0.25, disease: 0.15 },
];

export const soilData = [
  { zone: "Zone A", moisture: 45, temperature: 22, ph: 6.8, nitrogen: 78 },
  { zone: "Zone B", moisture: 38, temperature: 24, ph: 7.2, nitrogen: 65 },
  { zone: "Zone C", moisture: 52, temperature: 20, ph: 6.5, nitrogen: 82 },
  { zone: "Zone D", moisture: 41, temperature: 23, ph: 7.0, nitrogen: 71 },
];

export const pestRiskData = [
  { pest: "Aphids", risk: 75, trend: "+12%" },
  { pest: "Spider Mites", risk: 45, trend: "-5%" },
  { pest: "Cutworms", risk: 60, trend: "+8%" },
  { pest: "Thrips", risk: 30, trend: "-15%" },
];

export const fixedSensorPoints = [
  { top: 44.99719235272047, left: 20.610150167424102 },
  { top: 69.51239055522458, left: 37.91839131197557 },
  { top: 42.10470136930854, left: 31.619680942704456 },
  { top: 53.960490123731674, left: 29.701269435762093 },
  { top: 27.45601305701181, left: 45.97617608059495 },
  { top: 53.72470928455058, left: 30.46061364342391 },
  { top: 53.19326513415979, left: 41.294083180195926 },
  { top: 77.48388710597291, left: 25.477645932604105 },
];

export const menuItems = [
  { id: "overview", label: "Overview", icon: "TrendingUp" },
  { id: "crop-health", label: "Crop Health", icon: "Leaf" },
  { id: "soil-analysis", label: "Soil Analysis", icon: "Mountain" },
  { id: "pest-detection", label: "Pest Detection", icon: "Bug" },
  { id: "field-map", label: "Field Map", icon: "Map" },
  { id: "settings", label: "Settings", icon: "Settings" },
];