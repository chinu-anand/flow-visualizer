import { TraceId, GraphData } from '../types';
import { parseTraceIds, generateGraphData } from './splunkDataParser';

// Import the sample Splunk data
// Note: In a real application, this would be fetched from an API
import splunkData from '../static/testjsonlarge.json';

// Parse the trace IDs from the Splunk data
// This is done once at load time to avoid re-parsing on each request
const parsedTraceIds = parseTraceIds(splunkData);

// Cache for graph data to avoid regenerating it for the same trace ID
const graphDataCache: Record<string, GraphData> = {};

// API service
const api = {
  getTraceIds: async (searchValue: string, searchType: string = 'accountId', timeRange: string = '24hr'): Promise<TraceId[]> => {
    // In a real app, this would be an actual API call to fetch data
    console.log(`Fetching trace IDs (no additional filtering)`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Just return all parsed trace IDs, no further filtering
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
