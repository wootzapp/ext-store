import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import './App.css';

function AppContent() {
  return (
    <Routes>
      <Route 
        path="/chat" 
        element={<ChatInterface />} 
      />
      
      <Route 
        path="/settings" 
        element={<SettingsModal />} 
      />
      
      <Route 
        path="/" 
        element={<Navigate to="/chat" replace />} 
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