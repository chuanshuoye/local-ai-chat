'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AgentCard } from '@/components/agent/AgentCard';
import { Button } from '@/components/ui/button';
import { Agent, useAgentStore } from '@/store/agent-store';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const { agents, fetchAgents, removeAgent, isLoading, error } = useAgentStore();
  const router = useRouter();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // 创建一个适配器函数来处理类型转换
  const handleDelete = (agentOrId: string | Agent) => {
    const id = typeof agentOrId === 'string' ? agentOrId : agentOrId.id;
    removeAgent(id);
  };
  
  // 处理编辑 Agent
  const handleEdit = (agent: Agent) => {
    router.push(`/agents/${agent.id}`);
  };
  
  // 处理工作流
  const handleWorkflow = (agent: Agent) => {
    // 如果 Agent 有工作流，导航到工作流编辑页面
    router.push(`/workflow?agent=${agent.id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Agent 管理</h2>
          <Button>创建 Agent</Button>
        </div>
        
        {isLoading && <div className="text-center py-4">加载中...</div>}
        
        {error && (
          <div className="text-center py-4 text-red-500">
            错误: {error}
          </div>
        )}
        
        {!isLoading && !error && agents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            还没有创建任何 Agent，点击"创建 Agent"按钮开始吧
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onWorkflow={handleWorkflow}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 