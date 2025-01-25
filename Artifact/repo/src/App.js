import React, { useState } from 'react';
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

function App() {
  const { token, loading, error, saveToken, clearToken } = useAuthToken();
  // const [token, setToken] = useState(localStorage.getItem('authToken'));
  // const navigate = useNavigate();
  const handleLoginSuccess = async (newToken) => {
    const success = await saveToken(newToken);
    // localStorage.setItem('authToken', newToken);
    if (!success) {
      console.error('Failed to save token');
    }
    return success;
  };

  const handleLogout = async () => {
    const success = await clearToken();
    // localStorage.removeItem('authToken');
    // navigate('/relicdao/dashboard');
    // navigate('/relicdao/dashboard', { replace: true });
    if (!success) {
      console.error('Failed to clear token');
    }
    return success;
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>; // Or a loading spinner
    }
    // const token = localStorage.getItem('authToken');
    if (token && isTokenExpired(token)) {
      return <Navigate to="/login" replace />;
    }
    // setToken(localStorage.getItem('authToken'));
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // if (loading) {
  //   return <div>Loading...</div>; // Or a loading spinner
  // }

  // if (error) {
  //   return <div>Error: {error}</div>; // Or a more user-friendly error message
  // }

  return (
    <ThirdwebProvider activeChain="ethereum">
      <Router>
        <div className="min-h-screen min-w-screen relative">
          <Routes>
            <Route path="/login" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
            } />
            <Route path="/rewards" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <RelicDAOHomePage />
            } />
            <Route path="/relicdao" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <RelicDAOHomePage />
            } />
            <Route path="/signup" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <SignUpPage />
            } />
            <Route path="/relicdao/dashboard" element={
              <ProtectedRoute>
                <RelicDAODashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } />
            <Route path="/relicdao/dashboard/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <Navigate to="/relicdao" />
            } />

<Route path="/twitter-control" element={<TwitterControl />} />
            
            <Route 
              path="/scraped-data" 
              element={
                <ProtectedRoute>
                  <ScrapedData />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThirdwebProvider>
  );
}

export default App;
