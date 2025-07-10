import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { TraceId } from '../types';

const TraceIdsPage: React.FC = () => {
  const [traceIds, setTraceIds] = useState<TraceId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get search parameters from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const accountId = queryParams.get('accountId');
  const traceId = queryParams.get('traceId');
  const correlationId = queryParams.get('correlationId');
  const timeRange = queryParams.get('timeRange') || '24hr';
  
  // Determine which search parameter is being used
  const searchType = accountId ? 'accountId' : traceId ? 'traceId' : 'correlationId';
  const searchValue = accountId || traceId || correlationId || '';
  
  useEffect(() => {
    const fetchTraceIds = async () => {
      if (!searchValue) {
        setError(`No ${searchType} provided`);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Pass all search parameters to the API
        const data = await api.getTraceIds(searchValue, searchType, timeRange);
        setTraceIds(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching trace IDs:', err);
        setError('Failed to fetch trace IDs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTraceIds();
  }, [searchValue, searchType, timeRange]);
  
  const handleTraceIdClick = (traceId: string) => {
    navigate(`/graph?traceId=${encodeURIComponent(traceId)}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center text-red-600 p-4">
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-800">Trace IDs</h1>
        <p className="text-gray-600">
          {searchType === 'accountId' ? 'Account ID' : searchType === 'traceId' ? 'Trace ID' : 'X-Correlation-ID'}: 
          <span className="font-medium">{searchValue}</span>
        </p>
        <p className="text-gray-600">
          Time Range: <span className="font-medium">{timeRange}</span>
        </p>
      </div>
      
      {traceIds.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No trace IDs found for this account.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                  Trace ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                  Client App Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {traceIds.map((trace) => (
                <tr 
                  key={trace.id} 
                  onClick={() => handleTraceIdClick(trace.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-purple-800">{trace.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(trace.timestamp)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trace.clientAppName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      trace.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trace.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TraceIdsPage;
