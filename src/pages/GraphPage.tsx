import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { GraphData } from '../types';
import EventNode from '../components/EventNode';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'raw'>('overview');
  const [isCopied, setIsCopied] = useState(false);
  const jsonRef = useRef<HTMLPreElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get traceId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const traceId = queryParams.get('traceId');
  
  // Handle node click to show details in sidebar
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    setSelectedNode(node);
  }, []);
  
  // Close sidebar
  const closeSidebar = () => {
    setSelectedNode(null);
  };
  
  // Copy JSON to clipboard
  const copyToClipboard = (content?: any) => {
    const textToCopy = content 
      ? typeof content === 'string' ? content : JSON.stringify(content, null, 2)
      : selectedNode && jsonRef.current ? JSON.stringify(selectedNode.data.fullLog, null, 2) : '';
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  
  // Format JSON for display
  const formatJsonForDisplay = (json: any) => {
    if (!json) return null;
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };
  
  useEffect(() => {
    const fetchGraphData = async () => {
      if (!traceId) {
        setError('No Trace ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await api.getGraphData(traceId);
        
        // Transform data for React Flow - adjust positions for horizontal layout
        const horizontalNodes = data.nodes.map((node, index) => ({
          ...node,
          // Position nodes with more space between them and start from the left edge
          position: { x: index * 500, y: 150 },
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
  }, [traceId, setNodes, setEdges]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-800"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-5xl mx-auto pt-6">
        <div className="text-center text-red-600 p-4">
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-purple-800 text-white py-2 px-4 rounded-md hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-[80vh]">
      <div className={`flex-1 bg-white ${selectedNode ? 'w-2/3' : 'w-full'}`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-purple-800">
            Order Flow Visualization
          </h1>
          <p className="text-gray-600">
            Trace ID: <span className="font-medium">{traceId}</span>
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
              fitViewOptions={{ padding: 0.1, maxZoom: 0.8 }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              nodesDraggable={false}
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap />
              <Background color="#f3f4f6" gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
      
      {selectedNode && (
        <div className="w-1/3 border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-purple-800">Log Details</h2>
            <button 
              onClick={closeSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'overview' 
                ? 'text-purple-800 border-b-2 border-purple-800 font-medium' 
                : 'text-gray-500 hover:text-purple-800'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'raw' 
                ? 'text-purple-800 border-b-2 border-purple-800 font-medium' 
                : 'text-gray-500 hover:text-purple-800'}`}
              onClick={() => setActiveTab('raw')}
            >
              Raw Log
            </button>
          </div>
          
          {activeTab === 'overview' && (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700">Event</h3>
                <p className="text-gray-900">{selectedNode.data.event}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700">Client App</h3>
                <p className="text-gray-900">{selectedNode.data.clientAppName}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700">Status Code</h3>
                <p className={`font-medium ${
                  selectedNode.data.statusCode >= 200 && selectedNode.data.statusCode < 300 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {selectedNode.data.statusCode}
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700">Latency</h3>
                <p className="text-gray-900">{selectedNode.data.latency} ms</p>
              </div>
              
              {/* Request URL and Verb */}
              {(selectedNode.data.fullLog?.Request || selectedNode.data.fullLog?.RequestVerb) && (
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-700">Request Details</h3>
                  {selectedNode.data.fullLog?.RequestVerb && (
                    <p className="text-gray-900 mt-1">
                      <span className="font-medium">Method:</span> {selectedNode.data.fullLog.RequestVerb}
                    </p>
                  )}
                  {selectedNode.data.fullLog?.Request && (
                    <p className="text-gray-900 mt-1 break-all">
                      <span className="font-medium">URL:</span> {selectedNode.data.fullLog.Request}
                    </p>
                  )}
                </div>
              )}
              
              {/* Consumer Request */}
              {selectedNode.data.fullLog?.ConsumerRequest && (
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700">Consumer Request</h3>
                    <button
                      onClick={() => copyToClipboard(selectedNode.data.fullLog.ConsumerRequest)}
                      className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 mt-2">
                      {formatJsonForDisplay(selectedNode.data.fullLog.ConsumerRequest)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Consumer Response */}
              {selectedNode.data.fullLog?.ConsumerResponse && (
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700">Consumer Response</h3>
                    <button
                      onClick={() => copyToClipboard(selectedNode.data.fullLog.ConsumerResponse)}
                      className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 mt-2">
                      {formatJsonForDisplay(selectedNode.data.fullLog.ConsumerResponse)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Backend Request */}
              {selectedNode.data.fullLog?.BackendRequest && selectedNode.data.fullLog.BackendRequest !== "null" && (
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700">Backend Request</h3>
                    <button
                      onClick={() => copyToClipboard(selectedNode.data.fullLog.BackendRequest)}
                      className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 mt-2">
                      {formatJsonForDisplay(selectedNode.data.fullLog.BackendRequest)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Backend Response */}
              {selectedNode.data.fullLog?.BackendResponse && selectedNode.data.fullLog.BackendResponse !== "null" && (
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-700">Backend Response</h3>
                    <button
                      onClick={() => copyToClipboard(selectedNode.data.fullLog.BackendResponse)}
                      className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 mt-2">
                      {formatJsonForDisplay(selectedNode.data.fullLog.BackendResponse)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'raw' && (
            <div className="p-4">
              <div className="relative">
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors"
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
                <pre 
                  ref={jsonRef}
                  className="bg-gray-50 p-3 pt-10 rounded-md text-xs overflow-x-auto border border-gray-200"
                >
                  {JSON.stringify(selectedNode.data.fullLog, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphPage;
