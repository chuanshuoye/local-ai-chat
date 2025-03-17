'use client';

import { useState, useRef, ChangeEvent } from 'react';

interface FileUploadDialogProps {
  onClose: () => void;
  onFileSelected: (file: File | null) => void;
}

export function FileUploadDialog({ onClose, onFileSelected }: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = [
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4'
  ];
  
  const fileTypeNames = {
    'image/png': 'PNG 图片',
    'image/jpeg': 'JPEG 图片',
    'image/jpg': 'JPG 图片',
    'application/pdf': 'PDF 文档',
    'application/msword': 'DOC 文档',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX 文档',
    'video/mp4': 'MP4 视频'
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null);
    
    if (file) {
      if (allowedFileTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        setError('不支持的文件类型。请上传 PNG、JPG、DOC、PDF 或 MP4 文件。');
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = () => {
    onFileSelected(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    
    if (file) {
      if (allowedFileTypes.includes(file.type)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('不支持的文件类型。请上传 PNG、JPG、DOC、PDF 或 MP4 文件。');
        setSelectedFile(null);
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('pdf')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('video')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    }
    
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">上传文件</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center">
              {getFileIcon(selectedFile.type)}
              <span className="mt-2 text-sm font-medium text-gray-900">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {fileTypeNames[selectedFile.type as keyof typeof fileTypeNames] || selectedFile.type}
              </span>
              <button
                type="button"
                className="mt-2 text-sm text-red-600 hover:text-red-800"
                onClick={() => setSelectedFile(null)}
              >
                移除
              </button>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 mt-2">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>上传文件</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.mp4"
                  />
                </label>
                <p className="pl-1">或拖放文件到此处</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                支持 PNG, JPG, DOC, PDF, MP4 格式
              </p>
            </>
          )}
        </div>
        
        {error && (
          <div className="mb-4 text-sm text-red-600">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              selectedFile
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-400 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={!selectedFile}
          >
            上传
          </button>
        </div>
      </div>
    </div>
  );
} 