import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TraceIdsPage from './pages/TraceIdsPage';
import GraphPage from './pages/GraphPage';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/traceids" element={<TraceIdsPage />} />
            <Route path="/graph" element={<GraphPage />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
