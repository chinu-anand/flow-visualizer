import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const EventNode: React.FC<NodeProps> = ({ data }) => {
  const isSuccess = data.statusCode >= 200 && data.statusCode < 300;
  
  return (
    <div className={`px-4 py-3 shadow-md rounded-md w-full ${
      isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="flex flex-row justify-between w-full">
            <div className="text-sm font-bold mb-1">{data.label}</div>
            {data.fullLog?.RequestVerb && (
              <div className={`text-xs font-bold px-2 py-1 rounded inline-block w-fit ml-4 ${
                data.fullLog.RequestVerb === 'GET' ? 'bg-blue-100 text-blue-800' : 
                data.fullLog.RequestVerb === 'POST' ? 'bg-green-100 text-green-800' : 
                data.fullLog.RequestVerb === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 
                data.fullLog.RequestVerb === 'DELETE' ? 'bg-red-100 text-red-800' : 
                data.fullLog.RequestVerb === 'PATCH' ? 'bg-orange-100 text-orange-800' : 
                'bg-purple-100 text-purple-800'
              }`}>
                {data.fullLog.RequestVerb}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          <div className="flex justify-between">
            <span>{data.clientAppName}</span>
            
          </div>
          <div className="flex justify-between mt-1">
            <span>Latency: {data.latency}ms</span>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default memo(EventNode);
