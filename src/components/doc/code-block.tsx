'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 my-6">
      {filename && (
        <div className="bg-gray-800 px-4 py-2 text-gray-400 text-sm border-b border-gray-700">
          {filename}
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-gray-300">
          <code className={`language-${language}`}>{code}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
} 