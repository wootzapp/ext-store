import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Menu from './components/Menu';
import Instructions from './components/Instructions';
import UploadFile from './components/UploadFile';
import VehicleTagging from './components/VehicleTagging';
import AuthenticationPage from './authentication/AuthenticationPage';
import VehiclePositioning from './components/VehiclePositioning';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
            </>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/upload" element={<UploadFile />} />
          <Route path="/vehicle-tagging" element={<VehicleTagging />} />
          <Route path="/signin" element={<AuthenticationPage />} />
          <Route path="/vehicle-positioning" element={<VehiclePositioning />} />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
}

export default App;