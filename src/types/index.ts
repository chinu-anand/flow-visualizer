export interface Event {
  id: string;
  timestamp: string;
  service?: string;
  clientAppName?: string;
  status: 'success' | 'error' | 'pending';
  event?: string;
  data?: any;
  traceId?: string;
  correlationId?: string;
  parentId?: string;
}

export interface Cluster {
  id: string;
  events: Event[];
  startTime: Date;
  endTime: Date;
  duration: number;
  services: string[];
  status: 'success' | 'error' | 'mixed';
}

export interface Node {
  id: string;
  data: any;
  position: { x: number; y: number };
  type?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  type?: string;
  style?: any;
  label?: string;
  labelStyle?: any;
}

export interface TraceId {
  id: string;
  timestamp: string;
  clientAppName: string;
  status: 'success' | 'error' | 'pending';
  event: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface TimeWindowOption {
  label: string;
  value: number; // in milliseconds
}

export const DEFAULT_TIME_WINDOWS: TimeWindowOption[] = [
  { label: '100ms', value: 100 },
  { label: '500ms', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1min', value: 60000 },
  { label: '5min', value: 300000 },
  { label: '10min', value: 600000 },
];

export interface TimeRange {
  label: string;
  value: string;
  duration: number; // in milliseconds
}

export const TIME_RANGES: TimeRange[] = [
  { label: 'Last 1 hour', value: '1hr', duration: 60 * 60 * 1000 },
  { label: 'Last 6 hours', value: '6hr', duration: 6 * 60 * 60 * 1000 },
  { label: 'Last 24 hours', value: '24hr', duration: 24 * 60 * 60 * 1000 },
  { label: 'Last 3 days', value: '3days', duration: 3 * 24 * 60 * 60 * 1000 },
  { label: 'Last 7 days', value: '7days', duration: 7 * 24 * 60 * 60 * 1000 },
];
