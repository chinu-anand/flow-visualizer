import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-purple-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-white">Quantum Fiber Order Visualizer</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' 
                  ? 'text-white bg-purple-700' 
                  : 'text-purple-200 hover:text-white hover:bg-purple-700'
              }`}
            >
              Home
            </Link>
            {location.pathname === '/traceids' && (
              <div className="text-sm font-medium text-purple-200">
                Trace IDs
              </div>
            )}
            {location.pathname === '/graph' && (
              <div className="text-sm font-medium text-purple-200">
                Graph View
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
