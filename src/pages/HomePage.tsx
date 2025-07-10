import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('accountId');
  const [timeRange, setTimeRange] = useState('24hr');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError(`Please enter a ${searchType === 'accountId' ? 'Account ID' : searchType === 'traceId' ? 'Trace ID' : 'Correlation ID'}`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Navigate to the trace IDs page with the appropriate query parameter
    navigate(`/traceids?${searchType}=${encodeURIComponent(searchValue)}&timeRange=${encodeURIComponent(timeRange)}`);
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] pt-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-purple-800 mb-2">
          Search Orders
        </h1>
        
        <p className="text-gray-600 mb-10 text-center">
          Find and visualize order logs across Quantum Fiber services
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-wrap items-end gap-4">
            {/* Search Type Dropdown */}
            <div className="w-48">
              <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-1">
                Search By
              </label>
              <select
                id="searchType"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="accountId">Account ID</option>
                <option value="traceId">Trace ID</option>
                <option value="correlationId">X-Correlation-ID</option>
              </select>
            </div>
            
            {/* Search Input */}
            <div className="flex-grow">
              <label htmlFor="searchValue" className="block text-sm font-medium text-gray-700 mb-1">
                {searchType === 'accountId' ? 'Account ID' : searchType === 'traceId' ? 'Trace ID' : 'X-Correlation-ID'}
              </label>
              <input
                type="text"
                id="searchValue"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Enter ${searchType === 'accountId' ? 'account ID' : searchType === 'traceId' ? 'trace ID' : 'correlation ID'}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-800"
              />
            </div>
            
            {/* Time Range Dropdown */}
            <div className="w-36">
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="1hr">1 Hour</option>
                <option value="6hr">6 Hours</option>
                <option value="24hr">24 Hours</option>
                <option value="3days">3 Days</option>
                <option value="7days">7 Days</option>
              </select>
            </div>
            
            {/* Search Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-purple-800 text-white rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>
          
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </form>
        
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>For internal debugging and troubleshooting purposes only</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
