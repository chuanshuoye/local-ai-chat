'use client';

import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { FileUploadDialog } from './file-upload-dialog';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, onFileUpload, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showFileDialog, setShowFileDialog] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileButtonClick = () => {
    setShowFileDialog(true);
  };

  const handleFileSelected = (file: File | null) => {
    setShowFileDialog(false);
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <textarea
            rows={1}
            className="block w-full resize-none border-0 bg-transparent py-3 px-4 pb-12 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
            placeholder="输入消息..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2 pointer-events-none">
            <div className="flex items-center space-x-2 pointer-events-auto">
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-shrink-0 pointer-events-auto">
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  !message.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-0.5 mr-1.5 h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                发送
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {showFileDialog && (
        <FileUploadDialog 
          onClose={() => setShowFileDialog(false)} 
          onFileSelected={handleFileSelected} 
        />
      )}
    </div>
  );
} 