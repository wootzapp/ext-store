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
import NewSignup from './components/NewSignup';
import LandingPage from './components/LandingPage';

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

  // const handleLogout = async () => {
  //   const success = await clearToken();
  //   // localStorage.removeItem('authToken');
  //   // navigate('/relicdao/dashboard');
  //   // navigate('/relicdao/dashboard', { replace: true });
  //   if (!success) {
  //     console.error('Failed to clear token');
  //   }
  //   return success;
  // };

  // const ProtectedRoute = ({ children }) => {
  //   if (loading) {
  //     return <div>Loading...</div>; // Or a loading spinner
  //   }
  //   const token = localStorage.getItem('authToken');
  //   if (token && isTokenExpired(token)) {
  //     return <Navigate to="/login" replace />;
  //   }
  //   // setToken(localStorage.getItem('authToken'));
  //   if (!token) {
  //     return <Navigate to="/login" replace />;
  //   }
  //   return children;
  // };

  // if (loading) {
  //   return <div>Loading...</div>; // Or a loading spinner
  // }

  // if (error) {
  //   return <div>Error: {error}</div>; // Or a more user-friendly error message
  // }

  return (
    <ThirdwebProvider>
      <Router>
        <div className="min-h-screen min-w-screen relative">
          <Routes>
            <Route path="/signup" element={<NewSignup />} />
           
            <Route path="/relicdao/dashboard" element={
              <RelicDAODashboard />
            } />
            
            <Route path="/login" element={
              <Login onLoginSuccess={handleLoginSuccess} />
            } />
            <Route path="/rewards" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <RelicDAOHomePage />
            } />
            <Route path="/relicdao" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <RelicDAOHomePage />
            } />

            <Route path="/home" element={
              <RelicDAOHomePage />
            } />
            
            <Route path="/relicdao/dashboard/profile" element={
                <ProfilePage />         
            } />
            
            {/* Add a default route that redirects to /signup */}
            <Route path="*" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <Navigate to="/relicdao" />} />
          </Routes>
        </div>
      </Router>
    </ThirdwebProvider>
  );
}

export default App;
