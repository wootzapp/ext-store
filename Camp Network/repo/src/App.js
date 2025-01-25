import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import Dashboard from './components/Dashboard';
import TwitterControl from './components/TwitterControl';
import ScrapedData from './components/ScrapedData';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const isConnected = accounts.length > 0 && localStorage.getItem('walletConnected') === 'true';
          setIsAuthenticated(isConnected);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkWalletConnection();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const isConnected = accounts.length > 0 && localStorage.getItem('walletConnected') === 'true';
          setIsAuthenticated(isConnected);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkWalletConnection();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <div>
      <HashRouter>
        <Routes>
          {/* Public route - WalletConnect */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <WalletConnect />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/twitter-control" 
            element={
              <ProtectedRoute>
                <TwitterControl />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/scraped-data" 
            element={
              <ProtectedRoute>
                <ScrapedData />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
