'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WorkflowEditor } from '@/components/flow/WorkflowEditor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAgentStore } from '@/store/agent-store';

export default function WorkflowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadAgentWorkflow } = useAgentStore();
  
  // 从URL参数中获取需要加载的工作流ID
  const loadWorkflowId = searchParams.get('load');
  
  useEffect(() => {
    // 如果URL中包含load参数，则加载指定的工作流
    if (loadWorkflowId) {
      try {
        loadAgentWorkflow(loadWorkflowId);
      } catch (error) {
        console.error('加载工作流失败:', error);
        alert('加载工作流失败');
      }
    }
  }, [loadWorkflowId, loadAgentWorkflow]);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">工作流编辑器</h2>
          <Button 
            variant="outline"
            onClick={() => router.push('/workflow/manage')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            管理工作流
          </Button>
        </div>
        
        <Card className="p-4">
          <WorkflowEditor />
        </Card>
      </div>
    </MainLayout>
  );
} 