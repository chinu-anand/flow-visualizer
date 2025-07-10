import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TraceIdsPage from './pages/TraceIdsPage';
import GraphPage from './pages/GraphPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/traceids" element={<TraceIdsPage />} />
          <Route path="/graph" element={<GraphPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
