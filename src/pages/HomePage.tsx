import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Search } from 'lucide-react';

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
    <div className="flex flex-col w-full min-h-[80vh]">
      <div className="w-full px-4">
        <Card className="border-none shadow-md max-w-6xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Search Orders</CardTitle>
            <CardDescription>
              Find and visualize order logs across Quantum Fiber services
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Search Type Dropdown */}
                <div className="md:col-span-3">
                  <label htmlFor="searchType" className="text-sm font-medium mb-2 block">
                    Search By
                  </label>
                  <Select 
                    value={searchType} 
                    onValueChange={(value) => setSearchType(value as 'accountId' | 'traceId' | 'correlationId')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accountId">Account ID</SelectItem>
                      <SelectItem value="traceId">Trace ID</SelectItem>
                      <SelectItem value="correlationId">X-Correlation-ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Search Input */}
                <div className="md:col-span-5">
                  <label htmlFor="searchValue" className="text-sm font-medium mb-2 block">
                    {searchType === 'accountId' ? 'Account ID' : searchType === 'traceId' ? 'Trace ID' : 'X-Correlation-ID'}
                  </label>
                  <Input
                    id="searchValue"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={`Enter ${searchType === 'accountId' ? 'account ID' : searchType === 'traceId' ? 'trace ID' : 'correlation ID'}`}
                  />
                </div>
                
                {/* Time Range Dropdown */}
                <div className="md:col-span-2">
                  <label htmlFor="timeRange" className="text-sm font-medium mb-2 block">
                    Time Range
                  </label>
                  <Select 
                    value={timeRange} 
                    onValueChange={(value) => setTimeRange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1hr">Last 1 hour</SelectItem>
                      <SelectItem value="6hr">Last 6 hours</SelectItem>
                      <SelectItem value="24hr">Last 24 hours</SelectItem>
                      <SelectItem value="3days">Last 3 days</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Search Button */}
                <div className="md:col-span-2 flex items-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? 'Loading...' : 'Search'}
                  </Button>
                </div>
              </div>
              
              {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
          
          <CardFooter className="justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              For internal debugging and troubleshooting purposes only
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
