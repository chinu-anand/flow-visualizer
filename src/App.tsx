import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TraceIdsPage from './pages/TraceIdsPage';
import GraphPage from './pages/GraphPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
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
