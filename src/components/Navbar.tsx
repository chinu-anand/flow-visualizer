import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Home, Moon, Sun, Network, List, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="bg-primary border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Network className="h-6 w-6 text-primary-foreground" />
              <span className="text-xl font-bold text-primary-foreground">Quantum Fiber Order Visualizer</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? "secondary" : "ghost"}
                className={cn(
                  "gap-2",
                  location.pathname !== '/' && "text-primary-foreground hover:bg-background/80"
                )}
              >
                <Home className="h-4 w-4" /> Home
              </Button>
            </Link>
            
            {location.pathname === '/traceids' && (
              <Button variant="ghost" className="gap-2 text-primary-foreground hover:bg-background/80" disabled>
                <List className="h-4 w-4" /> Trace IDs
              </Button>
            )}
            
            {location.pathname === '/graph' && (
              <Button variant="ghost" className="gap-2 text-primary-foreground hover:bg-background/80" disabled>
                <Network className="h-4 w-4" /> Graph View
              </Button>
            )}
            
            {location.pathname === '/clusters' && (
              <Button variant="ghost" className="gap-2 text-primary-foreground hover:bg-background/80" disabled>
                <Clock className="h-4 w-4" /> Time Clusters
              </Button>
            )}
            
            {/* Dark mode toggle button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="text-primary-foreground hover:bg-background/80"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
