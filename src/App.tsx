import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TraceIdsPage from './pages/TraceIdsPage';
import ClustersPage from './pages/ClustersPage';
import GraphPage from './pages/GraphPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar />
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/traceids" element={
              <ProtectedRoute>
                <Navbar />
                <TraceIdsPage />
              </ProtectedRoute>
            } />
            <Route path="/clusters" element={
              <ProtectedRoute>
                <Navbar />
                <ClustersPage />
              </ProtectedRoute>
            } />
            <Route path="/graph" element={
              <ProtectedRoute>
                <Navbar />
                <GraphPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
