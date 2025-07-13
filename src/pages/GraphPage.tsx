import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Node as FlowNode,
  Edge as FlowEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../services/api';
import EventNode from '../components/EventNode';
import LogViewer from '../components/LogViewer';
import { ArrowLeft } from 'lucide-react';

// Register custom node types
const nodeTypes = {
  eventNode: EventNode,
};

const GraphPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get parameters from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const traceId = queryParams.get('traceId');
  const startTime = queryParams.get('startTime');
  const isCluster = queryParams.get('isCluster') === 'true';
  
  // Determine which ID to use - for clusters, we'll use the startTime as the ID
  const id = isCluster ? (startTime || 'time-cluster') : traceId;

  // Handle node click to show details in sidebar
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    setSelectedNode(node);
  }, []);

  // Close sidebar
  const closeSidebar = () => {
    setSelectedNode(null);
  };

  useEffect(() => {
    const fetchGraphData = async () => {
      if (!id) {
        setError('No ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await api.getGraphData(id, isCluster);

        // Transform data for React Flow - use consistent layout for both views
        const horizontalNodes = data.nodes.map((node) => ({
          ...node,
          // Use the positions provided by the API for both trace and cluster views
          // This ensures consistency between both views
          position: node.position || { x: 100, y: 200 },
          draggable: false // Lock nodes in place
        }));

        setNodes(horizontalNodes);
        setEdges(data.edges);
        setError(null);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Failed to fetch graph data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [id, isCluster, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-5xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-destructive p-4">
            <p className="text-lg">{error}</p>
            <Button
              onClick={() => navigate('/')}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className={`flex-1 bg-white dark:bg-gray-900 ${selectedNode ? 'w-2/3' : 'w-full'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 px-4">
          <h1 className="text-xl font-semibold text-purple-800 dark:text-purple-400">
            Order Flow Visualization
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isCluster ? 'Cluster' : 'Trace'} ID: <span className="font-medium">{id}</span>
          </p>
        </div>

        <div style={{ height: 'calc(100% - 80px)' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView={false}
              fitViewOptions={{ padding: 0.1, maxZoom: 1.2 }}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              nodesDraggable={false}
              attributionPosition="bottom-right"
              defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { strokeWidth: 2 } }}
            >
              <Controls />
              <MiniMap />
              <Background color="#f3f4f6" gap={16} className="dark:bg-gray-800" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {selectedNode && (
        <div className="w-1/3 border-l overflow-y-auto max-h-full min-h-0">
          <LogViewer selectedNode={selectedNode} onClose={closeSidebar} />
        </div>
      )}
    </div>
  );
};

export default GraphPage;