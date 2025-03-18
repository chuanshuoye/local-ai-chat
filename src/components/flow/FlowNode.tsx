import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import { useFlowStore, FlowNodeData } from '@/store/flow-store';

export const FlowNode = memo(({ id, data, isConnectable }: NodeProps<FlowNodeData>) => {
  const { selectedNodeId, setSelectedNode } = useFlowStore();
  const isSelected = selectedNodeId === id;
  
  // 根据节点类型返回不同的样式
  const getNodeStyle = () => {
    switch (data.type) {
      case 'input':
        return 'bg-green-50 border-green-300';
      case 'output':
        return 'bg-blue-50 border-blue-300';
      case 'custom':
        return 'bg-purple-50 border-purple-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div 
      className={`px-4 py-2 shadow-md rounded-md border-2 ${getNodeStyle()} 
      ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
      onClick={() => setSelectedNode(id)}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <div className="flex items-center">
        {data.icon && (
          <div className="rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 text-lg">
            {data.icon}
          </div>
        )}
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500">{data.description}</div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
});

FlowNode.displayName = 'FlowNode'; 