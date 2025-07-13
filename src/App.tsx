import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TraceIdsPage from './pages/TraceIdsPage';
import ClustersPage from './pages/ClustersPage';
import GraphPage from './pages/GraphPage';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/traceids" element={<TraceIdsPage />} />
            <Route path="/clusters" element={<ClustersPage />} />
            <Route path="/graph" element={<GraphPage />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
