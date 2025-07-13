import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [originalNodes, setOriginalNodes] = useState<FlowNode[]>([]);
  const [matchingNodeIds, setMatchingNodeIds] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);
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
        setOriginalNodes(horizontalNodes);
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

  // Filter nodes based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setNodes(originalNodes);
      setMatchingNodeIds([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const matchingIds: string[] = [];
    
    const filteredNodes = originalNodes.map(node => {
      // Check if node data contains the search term - only in event name and request path
      const nodeData = node.data;
      const nodeMatches = (
        // Check only event name
        (nodeData.event && nodeData.event.toLowerCase().includes(searchTermLower)) ||
        // Check only request path
        (nodeData.fullLog?.RequestPath && nodeData.fullLog.RequestPath.toLowerCase().includes(searchTermLower)) ||
        // Check the client app name
        (nodeData.clientAppName && nodeData.clientAppName.toLowerCase().includes(searchTermLower))
      );

      // Store IDs of matching nodes for navigation
      if (nodeMatches) {
        matchingIds.push(node.id);
      }

      // Return the node with updated style based on search match
      return {
        ...node,
        style: {
          ...node.style,
          opacity: nodeMatches ? 1 : 0.2,
          // Highlight matching nodes
          boxShadow: nodeMatches ? '0 0 10px #9ecaed' : undefined,
          zIndex: nodeMatches ? 1000 : 1
        }
      };
    });

    setNodes(filteredNodes);
    setMatchingNodeIds(matchingIds);
    setCurrentMatchIndex(matchingIds.length > 0 ? 0 : -1);
  }, [searchTerm, originalNodes, setNodes]);
  
  // Function to navigate to a specific node by ID
  const navigateToNode = useCallback((nodeId: string) => {
    if (!reactFlowInstance.current) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Center the view on the node with some animation
    reactFlowInstance.current.setCenter(
      node.position.x + (node.width || 0) / 2,
      node.position.y + (node.height || 0) / 2,
      { zoom: 1.2, duration: 800 }
    );
    
    // Optionally select the node
    const selectedNode = nodes.find(n => n.id === nodeId);
    if (selectedNode) {
      setSelectedNode(selectedNode);
    }
  }, [nodes, setSelectedNode]);
  
  // Navigate to next matching node
  const goToNextMatch = useCallback(() => {
    if (matchingNodeIds.length === 0) return;
    
    const nextIndex = (currentMatchIndex + 1) % matchingNodeIds.length;
    setCurrentMatchIndex(nextIndex);
    navigateToNode(matchingNodeIds[nextIndex]);
  }, [currentMatchIndex, matchingNodeIds, navigateToNode]);
  
  // Navigate to previous matching node
  const goToPrevMatch = useCallback(() => {
    if (matchingNodeIds.length === 0) return;
    
    const prevIndex = (currentMatchIndex - 1 + matchingNodeIds.length) % matchingNodeIds.length;
    setCurrentMatchIndex(prevIndex);
    navigateToNode(matchingNodeIds[prevIndex]);
  }, [currentMatchIndex, matchingNodeIds, navigateToNode]);

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
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Common header for both main content and sidebar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-xl font-semibold text-purple-800 dark:text-purple-400">
              Order Flow Visualization
            </h1>
            <span className="text-gray-600 dark:text-gray-300 text-base">
              {isCluster ? 'Cluster' : 'Trace'} ID: <span className="font-mono">{id}</span>
            </span>
            {/* {searchTerm && (
              <span className="text-sm text-purple-600 dark:text-purple-400">
                (Filtered by: {searchTerm})
              </span>
            )} */}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                type="text" 
                placeholder="Search event name or path..." 
                className="pl-8 pr-4 py-2" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
            
            {matchingNodeIds.length > 0 && (
              <div className="flex items-center space-x-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToPrevMatch}
                  className="h-8 w-8"
                  disabled={matchingNodeIds.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-xs text-gray-500">
                  {currentMatchIndex + 1}/{matchingNodeIds.length}
                </span>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={goToNextMatch}
                  className="h-8 w-8"
                  disabled={matchingNodeIds.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* ID label moved next to heading */}
      </div>
      
      {/* Content area with main content and sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 bg-white dark:bg-gray-900 ${selectedNode ? 'w-2/3' : 'w-full'}`}>
          <ReactFlowProvider>
            <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
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
                onInit={(instance) => { reactFlowInstance.current = instance; }}
              >
                <Controls />
                {/* <MiniMap /> */}
                <Background color="#f3f4f6" gap={16} className="dark:bg-gray-800" />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>

        {selectedNode && (
          <div className="w-1/3 border-l flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-400">Log Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSidebar}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-grow">
              <LogViewer selectedNode={selectedNode} onClose={closeSidebar} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphPage;