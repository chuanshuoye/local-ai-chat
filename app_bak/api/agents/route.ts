import { NextResponse } from 'next/server';
import { Agent } from '@/store/agent-store';

// 预设的 Agent 数据
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: '通用助手',
    type: 'general',
    description: '可以回答各种问题的通用AI助手',
    icon: '🤖',
    prompt: '你是一个通用AI助手，可以回答用户提出的各种问题。请尽可能提供准确、有用的信息。',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 一周前
  },
  {
    id: 'agent-2',
    name: '代码专家',
    type: 'code',
    description: '专注于代码和编程问题的AI助手',
    icon: '💻',
    prompt: '你是一个代码专家，擅长解决编程问题和代码相关问题。请提供清晰的代码示例和解释。',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5天前
  },
  {
    id: 'agent-3',
    name: '创意写作',
    type: 'creative',
    description: '帮助用户进行创意写作的AI助手',
    icon: '✍️',
    prompt: '你是一个创意写作助手，可以帮助用户构思故事、写诗、撰写文案等创意内容。请富有想象力地回应用户的请求。',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3天前
  },
  {
    id: 'agent-4',
    name: '学习导师',
    type: 'education',
    description: '辅助学习和解答学术问题的AI助手',
    icon: '🎓',
    prompt: '你是一个学习导师，擅长解释复杂概念、回答学术问题和提供学习资源。请使用简明易懂的语言帮助用户理解知识点。',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1天前
  },
  {
    id: 'agent-5',
    name: '工作流助手',
    type: 'workflow',
    description: '专门处理工作流程序的AI助手',
    icon: '⚙️',
    prompt: '你是一个工作流助手，擅长处理任务序列和流程自动化。你会根据工作流中的节点类型执行相应的操作。',
    createdAt: Date.now(),
  }
];

// GET 请求处理函数 - 获取所有 agents
export async function GET() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    success: true,
    data: mockAgents
  });
}

// POST 请求处理函数 - 创建新 agent
export async function POST(request: Request) {
  const data = await request.json();
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 创建新的 agent
  const newAgent: Agent = {
    id: `agent-${Date.now()}`,
    name: data.name || '未命名助手',
    type: data.type || 'custom',
    description: data.description || '',
    icon: data.icon || '🤖',
    prompt: data.prompt || '',
    createdAt: Date.now(),
  };
  
  return NextResponse.json({
    success: true,
    data: newAgent
  });
} 