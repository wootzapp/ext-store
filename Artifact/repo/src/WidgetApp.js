import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthToken } from './hooks/useAuthToken';
import WidgetDashboard from './components/WidgetDashboard';
import WidgetLogin from './components/WidgetLogin';

function WidgetApp() {
  const { token, loading } = useAuthToken();

  if (loading) {
    return <div className="w-screen h-screen flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={
          token ? <WidgetDashboard /> : <Navigate to="/" replace />
        } />
        <Route path="/" element={
          token ? <Navigate to="/dashboard" replace /> : <WidgetLogin />
        } />
      </Routes>
    </Router>
  );
}

export default WidgetApp; 