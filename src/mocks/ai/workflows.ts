import { HttpResponse, type HttpResponseResolver } from 'msw';
import { Node, Edge } from 'react-flow-renderer';

// 工作流数据的类型定义
interface WorkflowData {
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  nodeConfigs: Record<string, any>;
  agentId: string;
  type?: string;
  tags?: string[];
}

// 模拟数据：预设的工作流数据
const mockWorkflows = [
  {
    id: 'workflow-1',
    name: '文本处理工作流',
    description: '一个简单的文本处理工作流示例',
    nodes: [
      {
        id: 'node-1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: { 
          label: '输入文本',
          type: 'input',
          icon: '📝'
        }
      },
      {
        id: 'node-2',
        type: 'custom',
        position: { x: 250, y: 150 },
        data: { 
          label: '处理文本',
          type: 'custom',
          icon: '⚙️'
        }
      },
      {
        id: 'node-3',
        type: 'custom',
        position: { x: 250, y: 250 },
        data: { 
          label: '输出结果',
          type: 'output',
          icon: '📤'
        }
      }
    ] as Node[],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-2', target: 'node-3' }
    ] as Edge[],
    nodeConfigs: {
      'node-1': { text: '这是一段示例文本' },
      'node-2': { operation: 'toUpperCase' }
    },
    agentId: 'agent-1', // 关联到通用助手
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5天前
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000  // 2天前
  },
  {
    id: 'workflow-2',
    name: 'AI助手问答工作流',
    description: '使用多个AI助手处理问题的工作流',
    nodes: [
      {
        id: 'node-1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: { 
          label: '用户问题',
          type: 'input',
          icon: '❓'
        }
      },
      {
        id: 'node-2',
        type: 'custom',
        position: { x: 100, y: 150 },
        data: { 
          label: '通用助手',
          type: 'agent',
          icon: '🤖',
          agentId: 'agent-1'
        }
      },
      {
        id: 'node-3',
        type: 'custom',
        position: { x: 400, y: 150 },
        data: { 
          label: '专家助手',
          type: 'agent',
          icon: '👨‍💻',
          agentId: 'agent-2'
        }
      },
      {
        id: 'node-4',
        type: 'custom',
        position: { x: 250, y: 250 },
        data: { 
          label: '合并回答',
          type: 'custom',
          icon: '🔄'
        }
      },
      {
        id: 'node-5',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: { 
          label: '最终回答',
          type: 'output',
          icon: '💬'
        }
      }
    ] as Node[],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-1', target: 'node-3' },
      { id: 'edge-3', source: 'node-2', target: 'node-4' },
      { id: 'edge-4', source: 'node-3', target: 'node-4' },
      { id: 'edge-5', source: 'node-4', target: 'node-5' }
    ] as Edge[],
    nodeConfigs: {
      'node-1': { defaultQuestion: '什么是机器学习？' },
      'node-2': { temperature: 0.7 },
      'node-3': { temperature: 0.3 },
      'node-4': { mergeStrategy: 'concatenate' }
    },
    agentId: 'agent-5', // 与工作流助手关联
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3天前
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000  // 1天前
  },
  {
    id: 'workflow-3',
    name: '条件分支工作流',
    description: '根据不同条件执行不同分支的工作流',
    nodes: [
      {
        id: 'node-1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: { 
          label: '起始节点',
          type: 'input',
          icon: '🚀'
        }
      },
      {
        id: 'node-2',
        type: 'custom',
        position: { x: 250, y: 150 },
        data: { 
          label: '条件判断',
          type: 'condition',
          icon: '🔀',
          condition: 'value > 10'
        }
      },
      {
        id: 'node-3',
        type: 'custom',
        position: { x: 100, y: 250 },
        data: { 
          label: '小于等于10',
          type: 'custom',
          icon: '👇'
        }
      },
      {
        id: 'node-4',
        type: 'custom',
        position: { x: 400, y: 250 },
        data: { 
          label: '大于10',
          type: 'custom',
          icon: '👆'
        }
      },
      {
        id: 'node-5',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: { 
          label: '结束节点',
          type: 'output',
          icon: '🏁'
        }
      }
    ] as Node[],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', label: '否' },
      { id: 'edge-3', source: 'node-2', target: 'node-4', label: '是' },
      { id: 'edge-4', source: 'node-3', target: 'node-5' },
      { id: 'edge-5', source: 'node-4', target: 'node-5' }
    ] as Edge[],
    nodeConfigs: {
      'node-1': { initialValue: 5 },
      'node-2': { condition: 'value > 10' },
      'node-3': { action: 'multiply', value: 2 },
      'node-4': { action: 'add', value: 5 }
    },
    agentId: 'agent-2', // 与代码专家关联
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1天前
    updatedAt: Date.now()
  }
];

// GET /api/workflows - 获取所有工作流
export const handleGetWorkflows: HttpResponseResolver = async () => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return HttpResponse.json({
    success: true,
    data: mockWorkflows
  });
};

// POST /api/workflows - 创建新工作流
export const handleCreateWorkflow: HttpResponseResolver = async ({ request }) => {
  const data = await request.json() as WorkflowData;
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 创建新的工作流
  const now = Date.now();
  const newWorkflow = {
    id: `workflow-${now}`,
    name: data.name || '未命名工作流',
    description: data.description || '',
    nodes: data.nodes || [],
    edges: data.edges || [],
    nodeConfigs: data.nodeConfigs || {},
    agentId: data.agentId,
    type: data.type || 'custom',
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now
  };
  
  // 这里只是模拟响应，实际应用中会将工作流存储到数据库
  return HttpResponse.json({
    success: true,
    data: newWorkflow
  });
};

// GET /api/workflows/:id - 获取单个工作流
export const handleGetWorkflow: HttpResponseResolver = async ({ params }) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const workflow = mockWorkflows.find(w => w.id === params.id);
  
  if (!workflow) {
    return new HttpResponse(
      JSON.stringify({ success: false, error: '找不到指定的工作流' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return HttpResponse.json({
    success: true,
    data: workflow
  });
};

// PUT /api/workflows/:id - 更新工作流
export const handleUpdateWorkflow: HttpResponseResolver = async ({ request, params }) => {
  const data = await request.json() as Partial<WorkflowData>;
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 查找要更新的工作流
  const workflowIndex = mockWorkflows.findIndex(w => w.id === params.id);
  
  if (workflowIndex === -1) {
    return new HttpResponse(
      JSON.stringify({ success: false, error: '找不到指定的工作流' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 在实际应用中，这里会更新数据库中的工作流
  // 这里只是模拟成功响应
  const updatedWorkflow = {
    ...mockWorkflows[workflowIndex],
    ...data,
    updatedAt: Date.now()
  };
  
  return HttpResponse.json({
    success: true,
    data: updatedWorkflow
  });
};

// DELETE /api/workflows/:id - 删除工作流
export const handleDeleteWorkflow: HttpResponseResolver = async ({ params }) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 在实际应用中，这里会从数据库中删除工作流
  return HttpResponse.json({
    success: true,
    data: { id: params.id }
  });
};

// GET /api/workflows/by-agent - 按Agent ID获取工作流
export const handleGetWorkflowsByAgent: HttpResponseResolver = async ({ request }) => {
  // 获取查询参数
  const url = new URL(request.url);
  const agentId = url.searchParams.get('agentId');
  
  // 如果没有提供agentId，返回错误
  if (!agentId) {
    return new HttpResponse(
      JSON.stringify({ success: false, error: '请提供agentId参数' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 过滤出与指定Agent关联的工作流
  const agentWorkflows = mockWorkflows.filter(w => w.agentId === agentId);
  
  return HttpResponse.json({
    success: true,
    data: agentWorkflows
  });
}; 