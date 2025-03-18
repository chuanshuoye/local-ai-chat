'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WorkflowEditor } from '@/components/flow/WorkflowEditor';
import { Card } from '@/components/ui/card';

export default function WorkflowPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">工作流配置</h2>
        </div>
        
        <Card className="p-4">
          <WorkflowEditor />
        </Card>
      </div>
    </MainLayout>
  );
} 