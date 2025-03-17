'use client';

import { useState } from 'react';
import { AI_MODELS } from '@/constants';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  streamingEnabled: boolean;
  onStreamingToggle: (enabled: boolean) => void;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange,
  streamingEnabled,
  onStreamingToggle
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {/* 流式响应开关 */}
        <div className="flex items-center">
          <label htmlFor="streaming-toggle" className="mr-2 text-sm text-gray-700">
            流式响应
          </label>
          <div 
            className="relative inline-block w-10 align-middle select-none cursor-pointer"
            onClick={() => onStreamingToggle(!streamingEnabled)}
          >
            <input
              id="streaming-toggle"
              type="checkbox"
              checked={streamingEnabled}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${
              streamingEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${
              streamingEnabled ? 'translate-x-4' : ''
            }`}></div>
          </div>
        </div>
        
        {/* 模型选择器 */}
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-800"
          >
            <span>模型: {AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          
          {isOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <ul className="py-1">
                {AI_MODELS.map((model) => (
                  <li key={model.id}>
                    <button
                      onClick={() => handleModelSelect(model.id)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedModel === model.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={model.description}
                    >
                      {model.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 