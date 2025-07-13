import { Event } from '../types/index';

/**
 * Clusters events based on their timestamps
 * @param events Array of events to cluster
 * @param timeWindowMs Maximum time gap between events in the same cluster (in milliseconds)
 * @returns Array of event clusters
 */
export function clusterEventsByTime(events: Event[], timeWindowMs = 1000): Event[][] {
  if (!events || events.length === 0) {
    return [];
  }

  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => {
    const timestampA = new Date(a.timestamp).getTime();
    const timestampB = new Date(b.timestamp).getTime();
    return timestampA - timestampB;
  });

  const clusters: Event[][] = [];
  let currentCluster: Event[] = [sortedEvents[0]];
  
  for (let i = 1; i < sortedEvents.length; i++) {
    const currentEvent = sortedEvents[i];
    const previousEvent = sortedEvents[i-1];
    
    const currentTimestamp = new Date(currentEvent.timestamp).getTime();
    const previousTimestamp = new Date(previousEvent.timestamp).getTime();
    
    // If within time window, add to current cluster
    if (currentTimestamp - previousTimestamp <= timeWindowMs) {
      currentCluster.push(currentEvent);
    } else {
      // Start a new cluster
      clusters.push(currentCluster);
      currentCluster = [currentEvent];
    }
  }
  
  // Add the last cluster
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }
  
  return clusters;
}

/**
 * Enriches clusters with additional metadata
 * @param clusters Array of event clusters
 * @returns Array of enriched clusters with metadata
 */
export function enrichClusters(clusters: Event[][]): {
  events: Event[];
  startTime: Date;
  endTime: Date;
  duration: number;
  services: string[];
  status: 'success' | 'error' | 'mixed';
}[] {
  return clusters.map(cluster => {
    // Sort cluster events by timestamp
    const sortedEvents = [...cluster].sort((a, b) => {
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();
      return timestampA - timestampB;
    });
    
    // Extract start and end times
    const startTime = new Date(sortedEvents[0].timestamp);
    const endTime = new Date(sortedEvents[sortedEvents.length - 1].timestamp);
    
    // Calculate duration in milliseconds
    const duration = endTime.getTime() - startTime.getTime();
    
    // Extract unique services
    const services = Array.from(new Set(sortedEvents.map(event => event.service || 'unknown')));
    
    // Determine overall status
    const hasError = sortedEvents.some(event => event.status === 'error');
    const hasSuccess = sortedEvents.some(event => event.status === 'success');
    let status: 'success' | 'error' | 'mixed' = 'success';
    
    if (hasError && hasSuccess) {
      status = 'mixed';
    } else if (hasError) {
      status = 'error';
    }
    
    return {
      events: sortedEvents,
      startTime,
      endTime,
      duration,
      services,
      status
    };
  });
}

/**
 * Generates a unique ID for a cluster
 * @param cluster The cluster to generate an ID for
 * @returns A unique string ID
 */
export function generateClusterId(cluster: Event[]): string {
  if (!cluster || cluster.length === 0) {
    return 'empty-cluster';
  }
  
  const firstEvent = cluster[0];
  const lastEvent = cluster[cluster.length - 1];
  
  // Use the first event's timestamp and ID, plus the cluster size
  return `cluster-${new Date(firstEvent.timestamp).getTime()}-${firstEvent.id.substring(0, 8)}-${cluster.length}`;
}
