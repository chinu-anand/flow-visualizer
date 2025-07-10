import { TraceId, GraphData } from '../types';
import { parseTraceIds, generateGraphData } from './splunkDataParser';

// Import the sample Splunk data
// Note: In a real application, this would be fetched from an API
import splunkData from '../static/testjson.json';

// Parse the trace IDs from the Splunk data
// This is done once at load time to avoid re-parsing on each request
const parsedTraceIds = parseTraceIds(splunkData);

// Cache for graph data to avoid regenerating it for the same trace ID
const graphDataCache: Record<string, GraphData> = {};

// API service
const api = {
  getTraceIds: async (searchValue: string, searchType: string = 'accountId', timeRange: string = '24hr'): Promise<TraceId[]> => {
    // In a real app, this would be an actual API call to fetch data
    console.log(`Fetching trace IDs for ${searchType}: ${searchValue} with time range: ${timeRange}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Apply time range filter (in a real app, this would be part of the API query)
    // For now, we'll just simulate it by returning all data regardless of time range
    
    // Filter trace IDs based on search type and value
    if (searchValue) {
      return parsedTraceIds.filter(trace => {
        // Find related data for this trace ID
        const relatedData = splunkData.find(item => {
          const itemTraceId = item.result?.['fields.x-b3-traceid']?.[0];
          return itemTraceId === trace.id;
        });
        
        if (!relatedData) return false;
        
        // Apply filter based on search type
        if (searchType === 'accountId') {
          const itemAccountId = relatedData.result?.['fields.accountId']?.[0] || '';
          return itemAccountId.includes(searchValue);
        } else if (searchType === 'traceId') {
          return trace.id.includes(searchValue);
        } else if (searchType === 'correlationId') {
          const correlationId = relatedData.result?.['fields.x-correlation-id']?.[0] || '';
          return correlationId.includes(searchValue);
        }
        
        return false;
      });
    }
    
    // Return all parsed trace IDs if no search value
    return parsedTraceIds;
  },
  
  getGraphData: async (traceId: string): Promise<GraphData> => {
    // In a real app, this would be an actual API call
    console.log(`Fetching graph data for trace ID: ${traceId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return cached data if available
    if (graphDataCache[traceId]) {
      return graphDataCache[traceId];
    }
    
    // Generate graph data from Splunk data
    const graphData = generateGraphData(splunkData, traceId);
    
    // Cache the generated data
    graphDataCache[traceId] = graphData;
    
    return graphData;
  }
};

export default api;
