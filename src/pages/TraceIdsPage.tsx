import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { TraceId } from '../types';
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaUserCircle, FaPlayCircle, FaArrowLeft, FaInfoCircle, FaListUl } from 'react-icons/fa';

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
  
  // Utility to truncate trace IDs
  const truncateTraceId = (id: string) =>
    id.length > 30 ? id.slice(0, 30) + '...' : id;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <FaInfoCircle className="animate-spin text-4xl text-purple-800" />
        <span className="text-purple-800">Loading trace IDs...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center text-red-600 p-4">
          <p className="text-lg flex items-center justify-center gap-2"><FaTimesCircle className="text-xl" />{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto pt-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2"><FaListUl /> Trace IDs</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-2">
          {searchType === 'accountId' ? 'Account ID' : searchType === 'traceId' ? 'Trace ID' : 'X-Correlation-ID'}:
          <span className="font-medium ml-1">{searchValue}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <FaCalendarAlt /> Time Range: <span className="font-medium">{timeRange}</span>
        </p>
      </div>
      {traceIds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2"><FaInfoCircle /> No trace IDs found for this account.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-600 text-white dark:bg-indigo-800 dark:text-gray-100 py-2 px-4 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-900 flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-base">
            <thead className="bg-purple-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-purple-800 dark:text-purple-200 uppercase tracking-wider">Trace ID</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-purple-800 dark:text-purple-200 uppercase tracking-wider"><FaCalendarAlt className="inline mr-1" />Timestamp</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-purple-800 dark:text-purple-200 uppercase tracking-wider"><FaUserCircle className="inline mr-1" />Client App Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-purple-800 dark:text-purple-200 uppercase tracking-wider"><FaPlayCircle className="inline mr-1" />Starting Point</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {traceIds.map((trace, idx) => (
                <tr 
                  key={trace.id} 
                  onClick={() => handleTraceIdClick(trace.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                      <FaListUl className="text-purple-400 dark:text-purple-300" />{truncateTraceId(trace.id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FaCalendarAlt className="text-purple-400 dark:text-purple-300" />{formatDate(trace.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FaUserCircle className="text-purple-400 dark:text-purple-300" />{trace.clientAppName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900 dark:text-gray-100 font-semibold flex items-center gap-2">
                      <FaPlayCircle className="text-purple-400 dark:text-purple-300" />{trace.event || '—'}
                    </div>
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
