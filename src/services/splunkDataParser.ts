import { TraceId, GraphData, Node, Edge, Cluster, Event } from '../types/index';
import { JsonFixer } from './JsonFixer';

/**
 * Parses Splunk JSON data and extracts trace IDs
 * @param splunkData The raw Splunk JSON data
 * @returns Array of TraceId objects
 */
export const parseTraceIds = (splunkData: any[]): TraceId[] => {
  const traceIds: TraceId[] = [];
  const processedTraceIds = new Set<string>();

  splunkData.forEach(item => {
    // Extract trace ID from the data
    const traceId = item.result?.["fields.x-b3-traceid"]?.[0] ||
      (item.result?._raw && JsonFixer.fix(item.result._raw)?.fields?.["x-b3-traceid"]);

    if (traceId && !processedTraceIds.has(traceId)) {
      processedTraceIds.add(traceId);

      // Extract other required fields
      const timestamp = item.result?._time || new Date().toISOString();
      const clientAppName = item.result?.["fields.ClientAppName"]?.[0] || "Unknown App";

      // Determine status based on status code
      const statusCode = parseInt(item.result?.["fields.StatusCode"]?.[0] || "200");
      const status = statusCode >= 400 ? 'error' : 'success';

      // Extract event name for starting point
      let event = item.result?.event?.[0];
      if (!event && item.result?._raw) {
        try {
          const rawObj = JsonFixer.fix(item.result._raw);
          event = rawObj?.event || rawObj?.fields?.event;
        } catch {}
      }
      if (!event) event = '—';

      traceIds.push({
        id: traceId,
        timestamp,
        clientAppName,
        status,
        event
      });
    }
  });

  return traceIds;
};

/**
 * Generates graph data for a specific trace ID from Splunk data
 * @param splunkData The raw Splunk JSON data
 * @param traceId The trace ID to generate graph for
 * @returns GraphData object with nodes and edges
 */
export const generateGraphData = (splunkData: any[], traceId: string): GraphData => {
  // Filter data for the specific trace ID
  const relevantData = splunkData.filter(item => {
    const itemTraceId = item.result?.["fields.x-b3-traceid"]?.[0] ||
      (item.result?._raw && JsonFixer.fix(item.result._raw)?.fields?.["x-b3-traceid"]);
    return itemTraceId === traceId;
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes for each relevant data point
  relevantData.forEach((item, index) => {
    const nodeId = `node-${index + 1}`;
    const raw = item.result?._raw ? JsonFixer.fix(item.result._raw) : {};
    const fields = raw.fields || {};

    // Extract data for node
    const event = item.result?.event?.[0] || fields.event || "Unknown Event";
    const clientAppName = item.result?.["fields.ClientAppName"]?.[0] || fields.ClientAppName || "Unknown App";
    const statusCode = parseInt(item.result?.["fields.StatusCode"]?.[0] || fields.StatusCode || "200");
    const timestamp = item.result?._time || new Date().toISOString();

    // Calculate a mock latency based on the timestamp if available
    const receivedTime = fields["client.received.time"];
    const sentTime = fields["client.sent.time"];
    const latency = receivedTime && sentTime ? sentTime - receivedTime : Math.floor(Math.random() * 200) + 20;

    // Create node with vertical positioning
    nodes.push({
      id: nodeId,
      data: {
        label: event,
        clientAppName,
        statusCode,
        latency,
        event,
        fullLog: {
          ...fields
        }
      },
      position: { x: 400, y: 150 + (index * 200) }, // Vertical positioning with more space
      type: 'eventNode'
    });

    // Create edge to previous node if not the first node
    if (index > 0) {
      edges.push({
        id: `edge-${index}-${index + 1}`,
        source: `node-${index}`,
        target: nodeId
      });
    }
  });

  // If no nodes were created (no matching data), create a placeholder node
  if (nodes.length === 0) {
    nodes.push({
      id: 'node-1',
      data: {
        label: 'No Data Available',
        clientAppName: 'Unknown',
        statusCode: 404,
        latency: 0,
        event: 'NO_DATA',
        fullLog: {
          message: 'No data available for this trace ID'
        }
      },
      position: { x: 400, y: 150 }, // Consistent with other nodes
      type: 'eventNode'
    });
  }

  return { nodes, edges };
};

/**
 * Generates graph data for a time-based cluster using the same splunkData
 * @param splunkData The raw Splunk JSON data
 * @param timeWindowMs The time window in milliseconds for clustering
 * @param startTime Optional start time for filtering
 * @returns GraphData object with nodes and edges
 */
export const generateTimeClusterGraphData = (splunkData: any[], timeWindowMs: number = 300000, startTime?: string): GraphData => {
  // Extract all events from splunkData
  const allEvents = splunkData.map(item => {
    // Handle null/undefined item
    if (!item || !item.result) {
      return null;
    }
    
    try {
      const raw = item.result._raw ? JsonFixer.fix(item.result._raw) : {};
      const fields = raw.fields || {};
      
      // Extract the same data as in generateGraphData
      const event = item.result.event?.[0] || fields.event || "Unknown Event";
      const clientAppName = item.result['fields.ClientAppName']?.[0] || fields.ClientAppName || "Unknown App";
      const statusCode = parseInt(item.result['fields.StatusCode']?.[0] || fields.StatusCode || "200");
      const timestamp = item.result._time || new Date().toISOString();
      const traceId = item.result['fields.x-b3-traceid']?.[0] || fields['x-b3-traceid'] || '';
      
      return {
        event,
        clientAppName,
        statusCode,
        timestamp,
        traceId,
        fields
      };
    } catch (error) {
      console.error('Error processing item:', error);
      return null;
    }
  }).filter(item => item !== null); // Remove any null items
  
  // Filter by start time and time window if provided
  const filteredEvents = startTime 
    ? allEvents.filter(e => {
        if (!e) return false;
        const eventTime = new Date(e.timestamp).getTime();
        const startTimeMs = new Date(startTime).getTime();
        const endTimeMs = startTimeMs + timeWindowMs;
        // Only include events within the time window
        return eventTime >= startTimeMs && eventTime <= endTimeMs;
      })
    : allEvents;
  
  // Sort events by timestamp
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!a || !b) return 0;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
  
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Create nodes for each event - exactly like in generateGraphData
  sortedEvents.forEach((item, index) => {
    const nodeId = `node-${index + 1}`;
    
    // Calculate a mock latency based on the timestamp if available
    const receivedTime = item?.fields ? item.fields["client.received.time"] : null;
    const sentTime = item?.fields ? item.fields["client.sent.time"] : null;
    const latency = receivedTime && sentTime ? sentTime - receivedTime : Math.floor(Math.random() * 200) + 20;
    
    // Create node with vertical positioning
    nodes.push({
      id: nodeId,
      data: {
        label: item?.event,
        clientAppName: item?.clientAppName,
        statusCode: item?.statusCode,
        latency,
        event: item?.event,
        fullLog: {
          ...item?.fields
        }
      },
      position: { x: 400, y: 150 + (index * 200) }, // Vertical positioning with more space
      type: 'eventNode'
    });
    
    // Create edge to previous node if not the first node
    if (index > 0) {
      edges.push({
        id: `edge-${index}-${index + 1}`,
        source: `node-${index}`,
        target: nodeId
      });
    }
  });
  
  // If no nodes were created, create a placeholder node
  if (nodes.length === 0) {
    nodes.push({
      id: 'node-1',
      data: {
        label: 'No Data Available',
        clientAppName: 'Unknown',
        statusCode: 404,
        latency: 0,
        event: 'NO_DATA',
        fullLog: {
          message: 'No data available for this time window'
        }
      },
      position: { x: 400, y: 150 }, // Consistent with other nodes
      type: 'eventNode'
    });
  }
  
  return { nodes, edges };
};
