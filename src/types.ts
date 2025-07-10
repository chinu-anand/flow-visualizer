// Trace ID type definition
export interface TraceId {
  id: string;
  timestamp: string;
  clientAppName: string;
  status: 'success' | 'error';
  event?: string; // Add event property for starting point
}

// Node data for graph visualization
export interface NodeData {
  label: string;
  clientAppName: string;
  statusCode: number;
  latency: number;
  event: string;
  fullLog: any; // Full log JSON data
}

// Graph node type
export interface Node {
  id: string;
  data: NodeData;
  position: {
    x: number;
    y: number;
  };
  type: string;
}

// Graph edge type
export interface Edge {
  id: string;
  source: string;
  target: string;
}

// Complete graph data structure
export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}
