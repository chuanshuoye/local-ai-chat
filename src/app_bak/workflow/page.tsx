'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WorkflowEditor } from '@/components/flow/WorkflowEditor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAgentStore } from '@/store/agent-store';
import { useWorkflowStore } from '@/store/workflow-store';

export default function WorkflowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agents, fetchAgents } = useAgentStore();
  const { workflows, fetchWorkflows } = useWorkflowStore();
  
  // 获取URL参数
  const agentId = searchParams.get('agent');
  const workflowId = searchParams.get('id');
  const readOnly = searchParams.get('readonly') === 'true';
  const [agentData, setAgentData] = useState<{name: string, icon: string} | null>(null);
  const [workflowData, setWorkflowData] = useState<{name: string, description?: string} | null>(null);
  
  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      // 加载代理数据
      if (agentId) {
        await fetchAgents();
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
          setAgentData({
            name: agent.name,
            icon: agent.icon
          });
          
          // 如果代理有关联的工作流ID，尝试加载这个工作流
          if (agent.workflowId) {
            await fetchWorkflows();
            const workflow = workflows.find(w => w.id === agent.workflowId);
            if (workflow) {
              setWorkflowData({
                name: workflow.name,
                description: workflow.description
              });
            }
          }
        }
      }
      
      // 加载指定的工作流
      if (workflowId) {
        await fetchWorkflows();
        const workflow = workflows.find(w => w.id === workflowId);
        if (workflow) {
          setWorkflowData({
            name: workflow.name,
            description: workflow.description
          });
          
          // 如果工作流关联了代理，加载代理信息
          if (workflow.agentId) {
            await fetchAgents();
            const agent = agents.find(a => a.id === workflow.agentId);
            if (agent) {
              setAgentData({
                name: agent.name,
                icon: agent.icon
              });
            }
          }
        }
      }
    };
    
    loadData();
  }, [agentId, workflowId, fetchAgents, fetchWorkflows]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {agentData 
              ? `${agentData.name} 的工作流` 
              : workflowData
                ? workflowData.name
                : '工作流编辑器'
            }
          </h2>
          {!agentId && !workflowId && (
            <Button 
              variant="outline"
              onClick={() => router.push('/workflow/manage')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              管理工作流
            </Button>
          )}
        </div>
        
        <Card className="p-4">
          <WorkflowEditor 
            agentId={agentId || undefined}
            workflowId={workflowId || undefined}
            agentName={agentData?.name}
            agentIcon={agentData?.icon}
            workflowName={workflowData?.name}
            workflowDescription={workflowData?.description}
            readOnly={readOnly}
          />
        </Card>
      </div>
    </MainLayout>
  );
} 