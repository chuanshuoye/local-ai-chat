'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAgentStore } from '@/store/agent-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WorkflowManagePage() {
  const router = useRouter();
  const { agents, fetchAgents, isLoading } = useAgentStore();
  const [workflows, setWorkflows] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    agentName: string;
    agentIcon: string;
    updatedAt: Date;
    nodeCount: number;
    edgeCount: number;
  }>>([]);

  // 从agents中提取工作流信息
  useEffect(() => {
    const fetchWorkflowData = async () => {
      await fetchAgents();
      
      const workflowData = agents
        .filter(agent => agent.workflow)
        .map(agent => ({
          id: agent.id,
          name: agent.workflow?.name || '未命名工作流',
          description: agent.workflow?.description,
          agentName: agent.name,
          agentIcon: agent.icon,
          updatedAt: new Date(agent.workflow?.updatedAt || Date.now()),
          nodeCount: agent.workflow?.nodes.length || 0,
          edgeCount: agent.workflow?.edges.length || 0,
        }));
      
      setWorkflows(workflowData);
    };
    
    fetchWorkflowData();
  }, [fetchAgents]);

  // 跳转到工作流编辑器
  const handleEditWorkflow = (agentId: string) => {
    router.push(`/workflow?load=${agentId}`);
  };
  
  // 创建新工作流
  const handleCreateNew = () => {
    router.push('/workflow');
  };

  return (
    <MainLayout>
      <div className="space-y-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">工作流管理</h2>
          <Button onClick={handleCreateNew}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            创建新工作流
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">暂无工作流</h3>
              <p className="text-gray-500 mb-6">您还没有创建任何工作流，点击上方按钮开始创建</p>
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md shadow-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                创建第一个工作流
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map(workflow => (
              <Card key={workflow.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 border-b p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl text-blue-600 mr-3">
                        {workflow.agentIcon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription className="mt-1">{workflow.agentName}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-4 h-12 overflow-hidden">
                    {workflow.description || '无描述'}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <div>节点: {workflow.nodeCount}</div>
                    <div>连线: {workflow.edgeCount}</div>
                    <div>更新: {workflow.updatedAt.toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditWorkflow(workflow.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      编辑
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      运行
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 