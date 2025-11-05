import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardAPI } from '../services/api';
import '../styles/Dashboard.css';
import SignupOverlay from './SignupOverlay';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Simplified API calls for Android compatibility
        const data = {
          monitoring: await fetchWithFallback(DashboardAPI.monitoring),
          network: await fetchWithFallback(DashboardAPI.networkCheck),
          graphql: await fetchWithFallback(DashboardAPI.graphqlQuery),
          batch: await fetchWithFallback(DashboardAPI.batchProject),
          listings: await fetchWithFallback(DashboardAPI.getMobileListings),
          amplitude: await fetchWithFallback(DashboardAPI.trackAmplitude)
        };

        setDashboardData(data);
      } catch (err) {
        console.error('Dashboard initialization failed:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Helper function to safely fetch and parse data
  const fetchWithFallback = async (apiCall) => {
    try {
      const response = await apiCall();
      if (!response) return null;
      
      // Handle both text and JSON responses
      if (response.text && typeof response.text === 'function') {
        const text = await response.text();
        return text ? JSON.parse(text) : null;
      }
      return response;
    } catch (err) {
      console.warn('API call failed:', err);
      return null;
    }
  };

  const handleTaskClick = () => {
    navigate('/upload'); // Navigate directly to upload instead of showing signup
  };
  
  const handleMenuClick = () => {
    navigate('/menu');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">Unable to load dashboard. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <button className="menu-button" onClick={handleMenuClick}>☰</button>
        <h1>Dashboard</h1>
        <div className="balance">
          <span>$0.16 USDC</span>
        </div>
      </header>
      
      <div className="tasks-grid">
        <div className="task-card active" onClick={handleTaskClick}>
          <div className="task-icon">📄</div>
          <h2>Vehicle Positioning</h2>
          <div className="task-reward">$0.02 USDC</div>
        </div>
        
        <div className="task-card" onClick={handleTaskClick}>
          <div className="task-icon">✓</div>
          <h2>Tag-a-dog</h2>
          <div className="task-reward">$0.02 USDC</div>
        </div>
        
        <div className="task-card" onClick={handleTaskClick}>
          <div className="task-icon">👑</div>
          <h2>Textography</h2>
          <div className="task-reward">$0.02 USDC</div>
        </div>
        
        <div className="task-card" onClick={handleTaskClick}>
          <div className="task-icon">✓</div>
          <h2>Drivesight</h2>
          <div className="task-reward">$0.02 USDC</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;