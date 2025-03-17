import { DocHeader } from '@/components/doc-header';
import { CodeBlock } from '@/components/code-block';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <DocHeader 
        title="Next.js React AI Documentation" 
        description="A comprehensive guide to building AI-powered applications with Next.js and React" 
      />
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Introduction</h2>
        <p className="text-gray-600 leading-relaxed">
          Welcome to the Next.js React AI documentation. This guide will help you understand how to build
          modern, AI-powered web applications using Next.js, React, and various AI technologies.
        </p>
        <p className="text-gray-600 leading-relaxed">
          This project combines the power of Next.js for server-side rendering and static site generation
          with React for building interactive user interfaces, and integrates AI capabilities to create
          intelligent web applications.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Server-side rendering and static site generation with Next.js</li>
          <li>React components for building interactive UIs</li>
          <li>Tailwind CSS for styling</li>
          <li>AI integration for intelligent features</li>
          <li>TypeScript for type safety</li>
          <li>Responsive design for all devices</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Quick Start</h2>
        <p className="text-gray-600 leading-relaxed">
          To get started with this project, clone the repository and install the dependencies:
        </p>
        
        <CodeBlock 
          language="bash"
          code={`git clone https://github.com/yourusername/nextjs-react-ai.git
cd nextjs-react-ai
npm install
npm run dev`}
        />
        
        <p className="text-gray-600 leading-relaxed">
          This will start the development server at <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">http://localhost:3000</code>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Basic Example</h2>
        <p className="text-gray-600 leading-relaxed">
          Here&apos;s a simple example of how to create a component that uses AI features:
        </p>
        
        <CodeBlock 
          language="tsx"
          filename="components/AIGreeting.tsx"
          code={`'use client';

import { useState, useEffect } from 'react';

export function AIGreeting() {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGreeting() {
      try {
        const response = await fetch('/api/ai/greeting');
        const data = await response.json();
        setGreeting(data.greeting);
      } catch (error) {
        console.error('Error fetching AI greeting:', error);
        setGreeting('Hello, world!');
      } finally {
        setLoading(false);
      }
    }

    fetchGreeting();
  }, []);

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      {loading ? (
        <p className="text-gray-600">Loading personalized greeting...</p>
      ) : (
        <p className="text-xl font-medium text-blue-800">{greeting}</p>
      )}
    </div>
  );
}`}
        />
      </section>

      <section className="space-y-4 pb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Next Steps</h2>
        <p className="text-gray-600 leading-relaxed">
          Explore the documentation to learn more about:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Setting up AI services and APIs</li>
          <li>Building AI-powered components</li>
          <li>Implementing authentication and authorization</li>
          <li>Deploying your application</li>
          <li>Performance optimization</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-4">
          Check out the sidebar for more detailed guides on each topic.
        </p>
      </section>
    </div>
  );
} 