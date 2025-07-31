import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import ChatInterface from './components/ChatInterface';
import AuthPage from './components/AuthPage';
import SubscriptionPage from './components/SubscriptionPage';
import SettingsModal from './components/SettingsModal';
import ProfilePage from './components/ProfilePage';
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
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 220, 220, 0.3)',
          borderTop: '4px solid #FFDCDCFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <div style={{ 
          fontSize: '16px', 
          color: '#FFDCDCFF',
          textAlign: 'center'
        }}>
          <span id="loading-text"> </span>
        </div>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes dots {
              0% { content: 'Loading'; }
              33% { content: 'Loading.'; }
              66% { content: 'Loading..'; }
              100% { content: 'Loading...'; }
            }
            
            #loading-text::after {
              content: '';
              animation: dots 1.5s infinite;
            }
          `}
        </style>
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
        path="/" 
        element={<Navigate to={isLoggedIn ? "/chat" : "/auth"} replace />} 
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