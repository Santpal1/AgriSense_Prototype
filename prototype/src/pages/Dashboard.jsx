import React from 'react';
import Navbar from './Navbar';
import Overview from './Overview';
import CropHealth from './CropHealth';
import Soil from './Soil';
import PestRisk from './PestRisk';

const Dashboard = () => (
  <div>
    <Navbar />
    <Overview />
    <CropHealth />
    <Soil />
    <PestRisk />
  </div>
);

export default Dashboard;
