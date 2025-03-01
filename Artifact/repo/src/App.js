/* global chrome */
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/LoginPage';
import RewardsPage from './components/RewardsPage';
import ProfilePage from './components/ProfilePage';
import RelicDAOPage from './components/RelicDAOPage';
import RelicDAODashboard from './components/RelicDAODashboard';
import SignUpPage from './components/SignupPage';
import RelicDAOHomePage from './components/RelicDAOHomePage';
import { ThirdwebProvider } from 'thirdweb/react';
import { useAuthToken } from './hooks/useAuthToken';
import { isTokenExpired } from './services/tokenUtils';
import TwitterControl from './components/TwitterControl';
import ScrapedData from './components/ScrapedData';
import NewSignup from './components/NewSignup';
import LandingPage from './components/LandingPage';

function App() {
  const { token, loading, error, saveToken, clearToken } = useAuthToken();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Check chrome storage first
      const storage = await chrome.storage.local.get(['authToken', 'isLoggedIn']);
      const localToken = localStorage.getItem('authToken');
      
      // If chrome storage has token but localStorage doesn't, sync them
      if (storage.authToken && !localToken) {
        localStorage.setItem('authToken', storage.authToken);
      }
      
      setIsAuthenticated(!!storage.authToken || !!localToken);
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = async (newToken) => {
    const success = await saveToken(newToken);
    if (!success) {
      console.error('Failed to save token');
    }
    setIsAuthenticated(true);
    return success;
  };

  const LogoutComponent = () => {
    useEffect(() => {
      setIsAuthenticated(false);
      // Optionally clear storage
      localStorage.removeItem('authToken');
      chrome.storage.local.remove(['authToken', 'isLoggedIn']);
    }, []);
    
    return <Navigate to="/relicdao" />;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThirdwebProvider>
      <Router>
        <div className="min-h-screen min-w-screen relative">
          <Routes>
            <Route path="/signup" element={<NewSignup />} />
           
            <Route path="/relicdao/landing" element={
    isAuthenticated ? <LandingPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/relicdao" />
} />
            
            <Route path="/relicdao/dashboard" element={
              isAuthenticated ? <RelicDAODashboard /> : <Navigate to="/relicdao" />
            } />
            
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/relicdao/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
            } />
            
            <Route path="/rewards" element={
              isAuthenticated ? <Navigate to="/relicdao/dashboard" /> : <RelicDAOHomePage />
            } />
            
            <Route path="/relicdao" element={
              isAuthenticated ? <Navigate to="/relicdao/dashboard" /> : <RelicDAOHomePage />
            } />

            <Route path="/home" element={
              isAuthenticated ? <Navigate to="/relicdao/dashboard" /> : <RelicDAOHomePage />
            } />

            <Route path="/logout" element={<LogoutComponent />} />
            
            <Route path="/relicdao/dashboard/profile" element={
              isAuthenticated ? <ProfilePage /> : <Navigate to="/relicdao" />
            } />
            
            <Route path="*" element={
              isAuthenticated ? <Navigate to="/relicdao/dashboard" /> : <Navigate to="/relicdao" />
            } />
          </Routes>
        </div>
      </Router>
    </ThirdwebProvider>
  );
}

export default App;
