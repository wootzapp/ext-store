/* global chrome */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardAPI } from '../services/api';
import '../styles/Dashboard.css';
import wootzapp_icon from '../assets/wootzapp.png';
import multiplierIcon from '../assets/multiplier.png';
import dollarIcon from '../assets/dollar.png';
import pointsIcon from '../assets/points.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const fileInputRef = useRef(null);

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

  async function callSapienGraphQL() {
    try {
        // First get the auth token from storage
        let token = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['authToken', 'authData'], function(result) {
                if (chrome.runtime.lastError) {
                    reject(new Error('Failed to get auth token: ' + chrome.runtime.lastError.message));
                    return;
                }
                
                // Try to get token from direct storage first
                if (result.authToken) {
                    resolve(result.authToken);
                    return;
                }
                
                // If not found, try to get from authData
                if (result.authData && result.authData.token) {
                    resolve(result.authData.token);
                    return;
                }
                
                reject(new Error('Auth token not found in storage'));
            });
        });
        console.log('Auth token retrieved from storage');

        // Call the native sapienGraphQL function
        const response = await new Promise((resolve, reject) => {
            chrome.wootz.sapienGraphQL(token, (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                resolve(result);
            });
        });

        console.log('GraphQL response:', response);
        
        if (response.success) {
            // Parse the response data
            const data = JSON.parse(response.data);
            return data;
        } else {
            throw new Error(`Request failed with status ${response.statusCode}`);
        }

    } catch (error) {
        console.error('Error in callSapienGraphQL:', error);
        throw error;
    }
};


  const handleTaskClick = async (taskType) => { 
    if (taskType === 'vehicle-positioning') {
      try {
        // Usage example:
        try {
          const data = await callSapienGraphQL();
          console.log("Sapien data:", JSON.stringify(data, null, 2));
          navigate('/vehicle-positioning', { state: { sapienData: data } }); // Navigate to the new page
        } catch (error) {
          console.error('Failed to fetch Sapien data:', error);
        }          

        // First call sapienGame API
        // const gameResponse = await new Promise((resolve, reject) => {
        //   chrome.wootz.sapienGame((result) => {
        //     console.log('Raw game response:', result);
        //     if (chrome.runtime.lastError) {
        //       reject(chrome.runtime.lastError);
        //     } else {
        //       resolve(result);
        //     }
        //   });
        // });
        // console.log('Anuj: Response from sapienGame:', gameResponse);

        // Then call sapienMonitoring API
        // const monitoringResponse = await new Promise((resolve, reject) => {
        //   chrome.wootz.sapienMonitoring((result) => {
        //     console.log('Type of monitoring response:', typeof result);
        //     // console.log('Raw monitoring response:', result);            
        //     if (chrome.runtime.lastError) {
        //       reject(chrome.runtime.lastError);
        //     } else {
        //       resolve(result);
        //     }
        //   });
        // });

        // console.log('Payload from sapienMonitoring:', JSON.stringify(monitoringResponse, null, 2));

        // Clean and validate the game response data
        // let taggingData;
        // if (typeof gameResponse === 'string') {
        //   try {
        //     taggingData = JSON.parse(gameResponse);
        //   } catch (parseError) {
        //     console.error('JSON Parse Error:', parseError);
        //     throw new Error('Invalid JSON string response');
        //   }
        // } else if (gameResponse && typeof gameResponse === 'object') {
        //   taggingData = gameResponse.data || gameResponse;
        // } else {
        //   throw new Error('Invalid response format');
        // }

        // Validate the parsed data
        // if (!taggingData) {
        //   throw new Error('No valid data in response');
        // }
        // console.log('Parsed taggingData:', taggingData);

        // Navigate to vehicle tagging page
        // navigate('/vehicle-tagging', { state: { taggingData } });

      } catch (error) {
        console.error('Error in vehicle positioning flow:', error);
        alert('Failed to initialize vehicle positioning. Please try again.');
      }
    }
    else {
      navigate('/upload');
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        // You can add your upload logic here
        // For example:
        // await DashboardAPI.uploadImage(formData);
        
        alert('File selected: ' + file.name);
        // Clear the input
        event.target.value = '';
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
      }
    }
  };

  const handleBack = () => {
    navigate('/');
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
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <button className="back-button" onClick={handleBack}>⟪</button>
        </div>
        <div className="dashboard-header-right">
          <div className="dashboard-stats">
            <div className="stat-item">
              <img src={multiplierIcon} alt="Multiplier" className="stat-icon" />
              <span>1.00X</span>
            </div>
            <div className="stat-item">
              <img src={dollarIcon} alt="Dollar" className="stat-icon" />
              <span>0</span>
            </div>
            <div className="stat-item">
              <img src={pointsIcon} alt="Points" className="stat-icon" />
              <span>101</span>
            </div>
          </div>
          <button className="connect-wallet-button">
            <img src={wootzapp_icon} alt="Connect to Wallet" className="wallet-icon" />
            Connect Wallet
          </button>
        </div>
      </header>

      <div className="tasks-grid">
        <div className="task-card active" onClick={() => handleTaskClick('vehicle-positioning')}>
          <div className="task-icon">🚗</div>
          <h2>Vehicle Positioning</h2>
          <div className="task-reward">
            <span>💰</span>
            $0.02 USDC
          </div>
        </div>

        <div className="task-card" onClick={() => handleTaskClick('tag-a-dog')}>
          <div className="task-icon">🐕</div>
          <h2>Tag-a-dog</h2>
          <div className="task-reward">
            <span>💰</span>
            $0.02 USDC
          </div>
        </div>

        <div className="task-card" onClick={() => handleTaskClick('textography')}>
          <div className="task-icon">📝</div>
          <h2>Textography</h2>
          <div className="task-reward">
            <span>💰</span>
            $0.02 USDC
          </div>
        </div>

        <div className="task-card" onClick={() => handleTaskClick('drivesight')}>
          <div class="task-icon">🚦</div>
          <h2>Drivesight</h2>
          <div className="task-reward">
            <span>💰</span>
            $0.02 USDC
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;