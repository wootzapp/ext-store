import React from 'react'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import SignupPage from './components/SignupPage'
import Login from './components/Login'
import HomePage from './components/HomePage'
import LandingPage from './components/LandingPage'
import JobsPage from './components/JobsPage'

// Helper function to check if user is logged in
const isLoggedIn = () => {
  return localStorage.getItem('currentUser') !== null;
}

// Wrapper component for unauthenticated routes
const UnauthenticatedRoute = ({ children }) => {
  if (isLoggedIn()) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

// Wrapper component for authenticated routes
const AuthenticatedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

const App = () => {
  return (
    <Router>
      <div className='flex min-h-screen min-w-screen relative items-center justify-center bg-slate-500'>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={
            <UnauthenticatedRoute>
              <SignupPage />
            </UnauthenticatedRoute>
          } />
          <Route path="/login" element={
            <UnauthenticatedRoute>
              <Login />
            </UnauthenticatedRoute>
          } />
          <Route path="/home" element={
            <AuthenticatedRoute>
              <HomePage />
            </AuthenticatedRoute>
          } />
          <Route path="/jobs" element={
            <AuthenticatedRoute>
              <JobsPage />
            </AuthenticatedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
