import { NextResponse } from 'next/server';
import { MCP_SERVICES } from '@/constants';

// 模拟API响应延迟（实际项目中应删除）
const MOCK_DELAY = 500;

// 模拟MCP服务数据
const mockMCPServices = MCP_SERVICES.map(service => ({
  ...service,
  createdAt: Date.now() - Math.floor(Math.random() * 10000000),
  updatedAt: Date.now() - Math.floor(Math.random() * 1000000),
  isSystem: true
}));

// 添加一些自定义服务示例
const customMCPServices = [
  {
    id: 'mcp-custom-1',
    name: '自定义翻译服务',
    description: '提供多语言翻译和本地化服务',
    icon: '🌍',
    endpoint: 'https://api.example.com/translate',
    apiKey: 'sample-key-123',
    parameters: {
      sourceLanguage: 'auto',
      targetLanguage: 'zh-CN'
    },
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now() - 1000000
  },
  {
    id: 'mcp-custom-2',
    name: '内容审核',
    description: '提供内容审核和敏感信息检测',
    icon: '🔍',
    endpoint: 'https://api.example.com/moderate',
    apiKey: 'sample-key-456',
    createdAt: Date.now() - 3000000,
    updatedAt: Date.now() - 500000
  }
];

// GET：获取所有MCP服务
export async function GET() {
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // 合并预设和自定义服务
    const allServices = [...mockMCPServices, ...customMCPServices];
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: allServices
    });
  } catch (error) {
    console.error('获取MCP服务失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '获取MCP服务失败' 
      },
      { status: 500 }
    );
  }
}

// POST：创建新的MCP服务
export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证必要字段
    if (!body.name || !body.description) {
      return NextResponse.json(
        { 
          success: false,
          error: '缺少必要字段' 
        },
        { status: 400 }
      );
    }
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // 创建新服务
    const newService = {
      id: `mcp-custom-${Date.now()}`,
      name: body.name,
      description: body.description,
      icon: body.icon || '📝',
      endpoint: body.endpoint,
      apiKey: body.apiKey,
      parameters: body.parameters || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // 在实际应用中，应该将新服务保存到数据库
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: newService
    }, { status: 201 });
  } catch (error) {
    console.error('创建MCP服务失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '创建MCP服务失败' 
      },
      { status: 500 }
    );
  }
} 