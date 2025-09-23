import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import ChatInterface from './components/ChatInterface';
import AuthPage from './components/AuthPage';
import SubscriptionPage from './components/SubscriptionPage';
import SettingsModal from './components/SettingsModal';
import ProfilePage from './components/ProfilePage';
import HowToUsePage from './components/HowToUsePage';
// import IntegrationHub from './components/IntegrationHub';
// import LabubuRoute from './components/LabubuRoute';
import './App.css';
import ChatHistoryPage from './components/ChatHistoryPage';

function AppContent() {
  const { isLoggedIn, user, loading, login, signup, logout } = useAuth();
  const subscription = useSubscription(user);

  // Only show loading state during initial auth check, not during login/signup
  if (loading && !user && !isLoggedIn) {
    return (
      <div style={{
        position: 'fixed', 
        top: 0,           
        left: 0,          
        right: 0,         
        bottom: 0,        
        width: '100%',    
        height: '100%',   
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#002550FF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div className="spinner-loader" style={{
          marginBottom: '20px'
        }} />
        <div style={{ 
          fontSize: '16px', 
          color: '#FFDCDCFF',
          textAlign: 'center'
        }}>
          <div className="text-loader" style={{ fontSize: '16px' }}></div>
        </div>
        

      </div>
    );
  }

  const handleLogin = async (credentials) => {
    if (credentials.isNewUser) {
      return await signup(credentials);
    } else {
      return await login(credentials);
    }
  };

  return (
    <Routes>
      {/* Integration Hub - Main Landing Page */}
      <Route 
        path="/" 
        // element={<IntegrationHub />} 
        element={<Navigate to={"/chat"} replace />}
      />
      
      {/* Labubu Route */}
      {/* <Route 
        path="/labubu" 
        element={<LabubuRoute />} 
      /> */}
      
      <Route 
        path="/auth" 
        element={
          isLoggedIn ? (
            <Navigate to="/chat" replace />
          ) : (
            <AuthPage onLogin={handleLogin} />
          )
        } 
      />
      
      <Route 
        path="/chat" 
        element={
          !isLoggedIn ? (
            <Navigate to="/auth" replace />
          ) : (
            <ChatInterface 
              user={user}
              subscription={subscription}
              onLogout={logout}
            />
          )
        } 
      />
      
      <Route 
        path="/subscription" 
        element={
          !isLoggedIn ? (
            <Navigate to="/auth" replace />
          ) : (
            <SubscriptionPage 
              onSubscribe={async (data) => {
                console.log('Subscription:', data);
                return { success: true };
              }}
              onLogout={logout}
              onOpenSettings={() => window.location.hash = '/settings'}
              user={user}
            />
          )
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          !isLoggedIn ? (
            <Navigate to="/auth" replace />
          ) : (
            <SettingsModal />
          )
        } 
      />

      <Route 
        path="/profile" 
        element={
          !isLoggedIn ? (
            <Navigate to="/auth" replace />
          ) : (
            <ProfilePage 
              user={user}
              subscription={subscription}
              onLogout={logout}
            />
          )
        } 
      />
      
      <Route 
        path="/history" 
        element={
          !isLoggedIn ? (
            <Navigate to="/auth" replace />
          ) : (
            <ChatHistoryPage />
          )
        } 
      />
      
      <Route 
        path="/how-to-use" 
        element={
          !isLoggedIn ? (
            <Navigate to="/auth" replace />
          ) : (
            <HowToUsePage />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;