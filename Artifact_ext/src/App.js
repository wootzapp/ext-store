import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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

function App() {
  const { token, loading, error, saveToken, clearToken } = useAuthToken();

  const handleLoginSuccess = async (newToken) => {
    const success = await saveToken(newToken);
    if (!success) {
      console.error('Failed to save token');
    }
    return success;
  };

  const handleLogout = async () => {
    const success = await clearToken();
    if (!success) {
      console.error('Failed to clear token');
    }
    return success;
  };

  const ProtectedRoute = ({ children }) => {
    // if (loading) {
    //   return <div>Loading...</div>; // Or a loading spinner
    // }
    if (token && isTokenExpired(token)) {
      return <Navigate to="/login" replace />;
    }
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (error) {
    return <div>Error: {error}</div>; // Or a more user-friendly error message
  }

  return (
    <ThirdwebProvider activeChain="ethereum">
      <Router>
        <div className="min-h-screen min-w-screen relative">
          <Routes>
            <Route path="/login" element={
              token ? <Navigate to="/relicdao/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />
            } />
            <Route path="/rewards" element={<RelicDAOPage />} />
            <Route path="/relicdao" element={<RelicDAOHomePage />} />
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
              token ? <Navigate to="/relicdao/dashboard" /> : <Navigate to="/rewards" />
            } />
          </Routes>
        </div>
      </Router>
    </ThirdwebProvider>
  );
}

export default App;
