import { Event, Cluster, GraphData } from '../types/index';
import { clusterEventsByTime, enrichClusters, generateClusterId } from '../utils/clustering';
import { parseTraceIds, generateGraphData, generateTimeClusterGraphData } from './splunkDataParser';

// Import the sample Splunk data
// Note: In a real application, this would be fetched from an API
import splunkData from '../static/testjsonlarge.json';

// Parse the events from the Splunk data
// This is done once at load time to avoid re-parsing on each request
const parsedEvents = parseTraceIds(splunkData).map(trace => ({
  id: trace.id,
  timestamp: trace.timestamp,
  service: trace.clientAppName,
  clientAppName: trace.clientAppName,
  status: trace.status as 'success' | 'error' | 'pending',
  event: trace.event,
  traceId: trace.id
}));

// Cache for graph data to avoid regenerating it for the same trace ID or cluster ID
const graphDataCache: Record<string, GraphData> = {};

// Cache for clusters to avoid reclustering with the same parameters
const clusterCache: Record<string, Cluster[]> = {};

// API service
const api = {
  getEvents: async (searchValue: string, searchType: string = 'accountId', timeRange: string = '24hr'): Promise<Event[]> => {
    // In a real app, this would be an actual API call to fetch data
    console.log(`Fetching events with ${searchType}=${searchValue}, timeRange=${timeRange}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter events based on search criteria
    let filteredEvents = [...parsedEvents];
    
    // Apply additional filtering based on searchType and searchValue if needed
    // This is just a placeholder for real filtering logic
    if (searchValue && searchType === 'traceId') {
      filteredEvents = filteredEvents.filter(event => event.traceId?.includes(searchValue));
    }
    
    return filteredEvents;
  },
  
  getClusters: async (searchValue: string, searchType: string = 'accountId', timeRange: string = '24hr', timeWindowMs: number = 300000): Promise<Cluster[]> => {
    // Generate a cache key based on the parameters
    const cacheKey = `${searchValue}-${searchType}-${timeRange}-${timeWindowMs}`;
    
    // Return cached clusters if available
    if (clusterCache[cacheKey]) {
      return clusterCache[cacheKey];
    }
    
    // Fetch events
    const events = await api.getEvents(searchValue, searchType, timeRange);
    
    // Cluster events by time
    const eventClusters = clusterEventsByTime(events, timeWindowMs);
    
    // Enrich clusters with metadata
    const enrichedClusters = enrichClusters(eventClusters);
    
    // Add cluster IDs
    const clusters = enrichedClusters.map(cluster => ({
      ...cluster,
      id: generateClusterId(cluster.events)
    }));
    
    // Cache the clusters
    clusterCache[cacheKey] = clusters;
    
    return clusters;
  },
  
  // Legacy method for backward compatibility
  getTraceIds: async (searchValue: string, searchType: string = 'accountId', timeRange: string = '24hr'): Promise<any[]> => {
    console.log(`Fetching trace IDs (legacy method)`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return parseTraceIds(splunkData);
  },
  
  getGraphData: async (id: string, isCluster: boolean = false): Promise<GraphData> => {
    // In a real app, this would be an actual API call
    console.log(`Fetching graph data for ${isCluster ? 'cluster' : 'trace'} ID: ${id}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return cached data if available
    if (graphDataCache[id]) {
      return graphDataCache[id];
    }
    
    if (isCluster) {
      // Extract the startTime from the ID
      // The ID is actually the startTime that was passed from ClustersPage
      const startTime = id !== 'time-cluster' ? id : undefined;
      
      // Use the new function that works directly with splunkData
      const graphData = generateTimeClusterGraphData(splunkData, 300000, startTime); // 5 minutes time window
      
      // Cache the generated data
      graphDataCache[id] = graphData;
      
      return graphData;
    } else {
      // Generate graph data from Splunk data for a single trace ID
      const graphData = generateGraphData(splunkData, id);
      
      // Cache the generated data
      graphDataCache[id] = graphData;
      
      return graphData;
    }
  }
};

export default api;
