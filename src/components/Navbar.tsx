import React, { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaMoon, FaSun, FaProjectDiagram, FaListUl } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [dark, setDark] = React.useState(() => document.body.classList.contains('dark'));

  // Dark mode toggle handler
  const toggleDarkMode = useCallback(() => {
    document.body.classList.toggle('dark');
    setDark(document.body.classList.contains('dark'));
  }, []);

  return (
    <nav className="bg-purple-800 shadow-md">
      <div className=" px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <FaProjectDiagram className="text-2xl text-white" />
              <span className="text-xl font-bold text-white">Quantum Fiber Order Visualizer</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 rounded-md text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-700 focus:outline-none flex items-center gap-1"
              title="Toggle dark mode"
            >
              {dark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 ${
                location.pathname === '/' 
                  ? 'text-white bg-purple-700' 
                  : 'text-purple-200 hover:text-white hover:bg-purple-700'
              }`}
            >
              <FaHome /> Home
            </Link>
            {location.pathname === '/traceids' && (
              <div className="text-sm font-medium text-purple-200 flex items-center gap-1">
                <FaListUl /> Trace IDs
              </div>
            )}
            {location.pathname === '/graph' && (
              <div className="text-sm font-medium text-purple-200 flex items-center gap-1">
                <FaProjectDiagram /> Graph View
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
