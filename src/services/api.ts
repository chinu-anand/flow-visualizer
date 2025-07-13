import { Event, Cluster, GraphData } from '../types/index';
import { clusterEventsByTime, enrichClusters, generateClusterId } from '../utils/clustering';
import { parseTraceIds, generateGraphData, generateTimeClusterGraphData } from './splunkDataParser';
import splunkService from './splunkService';

// For development/testing, we can use static data if needed
import testSplunkData from '../static/testjsonlarge.json';

// Flag to toggle between real Splunk API and test data
const USE_REAL_SPLUNK = false; // Set to true when ready to use real Splunk API

// For development/testing with static data
const parsedTestEvents = parseTraceIds(testSplunkData).map(trace => ({
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
    try {
      if (USE_REAL_SPLUNK) {
        // Use real Splunk API
        const splunkResults = await splunkService.getTraceData(searchValue, searchType, timeRange);
        
        // Parse the results into our Event format
        const parsedEvents = parseTraceIds(splunkResults).map(trace => ({
          id: trace.id,
          timestamp: trace.timestamp,
          service: trace.clientAppName,
          clientAppName: trace.clientAppName,
          status: trace.status as 'success' | 'error' | 'pending',
          event: trace.event,
          traceId: trace.id
        }));
        
        return parsedEvents;
      } else {
        // Use test data for development
        console.log(`[DEV] Searching for ${searchValue} by ${searchType} in the last ${timeRange}`);
        
        // Filter the parsed events based on search criteria
        let filteredEvents = parsedTestEvents;
        
        if (searchValue) {
          if (searchType === 'traceId') {
            filteredEvents = parsedTestEvents.filter(event => event.traceId.includes(searchValue));
          } else if (searchType === 'accountId') {
            // In a real app, we would filter by accountId
            // For now, just return all events
          } else if (searchType === 'userId') {
            // In a real app, we would filter by userId
            // For now, just return all events
          }
        }
        
        return filteredEvents;
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events. Please try again.');
    }
  },
  
  getClusters: async (searchValue: string, searchType: string = 'accountId', timeRange: string = '24hr', timeWindowMs: number = 300000): Promise<Cluster[]> => {
    try {
      // Generate a cache key based on the search parameters
      const cacheKey = `${searchValue}-${searchType}-${timeRange}-${timeWindowMs}`;
      
      // Check if we have cached results
      if (clusterCache[cacheKey]) {
        return clusterCache[cacheKey];
      }
      
      // Get events based on search criteria
      const events = await api.getEvents(searchValue, searchType, timeRange);
      
      // Cluster events by time
      const clusters = clusterEventsByTime(events, timeWindowMs);
      
      // Enrich clusters with additional data
      const enrichedClusters = enrichClusters(clusters);
      
      // Add cluster IDs to match the Cluster type
      const clustersWithIds = enrichedClusters.map(cluster => ({
        ...cluster,
        id: generateClusterId(cluster.events)
      }));
      
      // Cache the results
      clusterCache[cacheKey] = clustersWithIds;
      
      return clustersWithIds;
    } catch (error) {
      console.error('Error fetching clusters:', error);
      throw new Error('Failed to fetch clusters. Please try again.');
    }
  },
  
  getGraphData: async (id: string, isCluster: boolean = false): Promise<GraphData> => {
    try {
      // Check if we have cached results
      if (graphDataCache[id]) {
        return graphDataCache[id];
      }
      
      let data = USE_REAL_SPLUNK ? [] : testSplunkData;
      
      if (USE_REAL_SPLUNK) {
        // If using real Splunk, fetch the data we need
        if (isCluster) {
          // For time-based clustering, we need to fetch data for a specific time window
          const startTime = id !== 'time-cluster' ? id : undefined;
          const timeRange = startTime ? `${new Date(startTime).toISOString()} to +5m` : '5m';
          data = await splunkService.search('index=*', { earliest_time: timeRange });
        } else {
          // For trace-based view, fetch data for the specific trace ID
          data = await splunkService.search(`index=* "fields.x-b3-traceid"="${id}"`);
        }
      }
      
      if (isCluster) {
        // Extract the startTime from the ID
        // The ID is actually the startTime that was passed from ClustersPage
        const startTime = id !== 'time-cluster' ? id : undefined;
        
        // Use the function that works directly with splunk data
        const graphData = generateTimeClusterGraphData(data, 300000, startTime); // 5 minutes time window
        
        // Cache the generated data
        graphDataCache[id] = graphData;
        
        return graphData;
      } else {
        // Generate graph data for a specific trace ID
        const graphData = generateGraphData(data, id);
        
        // Cache the generated data
        graphDataCache[id] = graphData;
        
        return graphData;
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw new Error('Failed to fetch graph data. Please try again.');
    }
  }
};

export default api;
