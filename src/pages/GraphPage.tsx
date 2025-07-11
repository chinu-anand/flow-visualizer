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
          // Add left margin to the first node for better appearance
          position: { x: 100 + index * 500, y: 200 },
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
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className={`flex-1 bg-white ${selectedNode ? 'w-2/3' : 'w-full'}`}>
        <div className="p-4 border-b border-gray-200 px-4">
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
        <div className="w-1/3 border-l border-gray-200 flex flex-col max-h-full min-h-0 bg-gray-50 dark:bg-gray-900">
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
          <div className="flex-1 min-h-0 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-4 flex flex-col gap-5">
                {/* Event */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                  <span className="text-purple-700 dark:text-purple-400 text-xl">
                    <svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Event</h3>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedNode.data.event}</p>
                  </div>
                </div>

                {/* Client App */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">
                    <svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Client App</h3>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedNode.data.clientAppName}</p>
                  </div>
                </div>

                {/* Status Code & Latency */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                    <span className="text-green-600 dark:text-green-400 text-xl">
                      <svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4-4" /></svg>
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Status Code</h3>
                      <p className={`text-lg font-bold ${selectedNode.data.statusCode >= 200 && selectedNode.data.statusCode < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{selectedNode.data.statusCode}</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700">
                    <span className="text-yellow-600 dark:text-yellow-400 text-xl">
                      <svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Latency</h3>
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{selectedNode.data.latency} ms</p>
                    </div>
                  </div>
                </div>

                {/* Request URL and Verb */}
                {(selectedNode.data.fullLog?.Request || selectedNode.data.fullLog?.RequestVerb) && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-indigo-600 dark:text-indigo-400 text-xl">
                        <svg className="inline h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18" /><path d="M12 3v18" /></svg>
                      </span>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Request Details</h3>
                    </div>
                    {selectedNode.data.fullLog?.RequestVerb && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Method:</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">{selectedNode.data.fullLog.RequestVerb}</span>
                      </div>
                    )}
                    {selectedNode.data.fullLog?.Request && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">URL:</span>
                        <span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 break-all">
                          {selectedNode.data.fullLog.Request}
                        </span>
                        <button
                          onClick={() => copyToClipboard(selectedNode.data.fullLog.Request)}
                          className="ml-2 bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Consumer Request */}
                {selectedNode.data.fullLog?.ConsumerRequest && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-700 dark:text-purple-400 text-xl">
                          <i className="react-icons fi fi-rr-upload"></i>
                        </span>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Consumer Request</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedNode.data.fullLog.ConsumerRequest)}
                        className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
                        {formatJsonForDisplay(selectedNode.data.fullLog.ConsumerRequest)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Consumer Response */}
                {selectedNode.data.fullLog?.ConsumerResponse && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 dark:text-green-400 text-xl">
                          <i className="react-icons fi fi-rr-download"></i>
                        </span>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Consumer Response</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedNode.data.fullLog.ConsumerResponse)}
                        className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
                        {formatJsonForDisplay(selectedNode.data.fullLog.ConsumerResponse)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Backend Request */}
                {selectedNode.data.fullLog?.BackendRequest && selectedNode.data.fullLog.BackendRequest !== "null" && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-700 dark:text-indigo-400 text-xl">
                          <i className="react-icons fi fi-rr-upload"></i>
                        </span>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Backend Request</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedNode.data.fullLog.BackendRequest)}
                        className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
                        {formatJsonForDisplay(selectedNode.data.fullLog.BackendRequest)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Backend Response */}
                {selectedNode.data.fullLog?.BackendResponse && selectedNode.data.fullLog.BackendResponse !== "null" && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 dark:text-green-400 text-xl">
                          <i className="react-icons fi fi-rr-download"></i>
                        </span>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300">Backend Response</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedNode.data.fullLog.BackendResponse)}
                        className="bg-purple-800 text-white px-2 py-1 rounded text-xs hover:bg-purple-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto border border-gray-200 dark:border-gray-700 mt-2">
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
        </div>
      )}
    </div>
  );
};

export default GraphPage;
