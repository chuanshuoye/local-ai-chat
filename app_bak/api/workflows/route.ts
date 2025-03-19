import { NextResponse } from 'next/server';
import { Workflow } from '@/store/workflow-store';
import { Node, Edge } from 'react-flow-renderer';

// 模拟数据：预设的工作流数据
const mockWorkflows: Workflow[] = [
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
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1天前
    updatedAt: Date.now()
  }
];

// GET 请求处理函数 - 获取所有工作流
export async function GET() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    success: true,
    data: mockWorkflows
  });
}

// POST 请求处理函数 - 创建新工作流
export async function POST(request: Request) {
  const data = await request.json();
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 创建新的工作流
  const now = Date.now();
  const newWorkflow: Workflow = {
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
  return NextResponse.json({
    success: true,
    data: newWorkflow
  });
} 