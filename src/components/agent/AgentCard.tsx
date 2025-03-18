import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Agent } from '@/store/agent-store';

interface AgentCardProps {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent | string) => void;
  onWorkflow?: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete, onWorkflow }: AgentCardProps) {
  return (
    <Card className="transition-all duration-normal hover:shadow-md">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-2xl text-primary-600">
            {agent.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              {agent.type}
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-2 line-clamp-2">
          {agent.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 space-y-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            创建于: {new Date(agent.createdAt).toLocaleDateString()}
          </div>
          {agent.workflow && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              工作流: {agent.workflow.name}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end space-x-2 border-t pt-4">
        {agent.workflow && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onWorkflow?.(agent)}
            className="text-primary-600 bg-primary-50 hover:bg-primary-100 border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            工作流
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit?.(agent)}
          className="text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete?.(agent.id)}
          className="bg-danger-50 text-danger-600 hover:bg-danger-100 border-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          删除
        </Button>
      </CardFooter>
    </Card>
  );
} 