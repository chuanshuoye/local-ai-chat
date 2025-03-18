import React from 'react';
import { nodeTemplates } from '@/store/flow-store';

interface NodeToolbarProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export function NodeToolbar({ onDragStart }: NodeToolbarProps) {
  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-800">节点工具箱</h3>
        <p className="text-sm text-gray-500 mt-1">拖拽节点到画布创建工作流</p>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100%-80px)]">
        {nodeTemplates.map((template) => (
          <div
            key={template.id}
            className="flex items-center p-3 border border-gray-200 rounded-md cursor-move bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm"
            draggable
            onDragStart={(event) => onDragStart(event, template.id)}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl text-blue-600 mr-3 flex-shrink-0">
              {template.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{template.label}</div>
              <div className="text-xs text-gray-500 truncate">{template.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 