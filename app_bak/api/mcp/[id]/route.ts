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

// 获取所有MCP服务的合并列表
const getAllServices = () => {
  return [...mockMCPServices, ...customMCPServices];
};

// 根据ID查找服务
const findServiceById = (id: string) => {
  return getAllServices().find(service => service.id === id);
};

// GET: 获取特定MCP服务
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    const serviceId = params.id;
    const service = findServiceById(serviceId);
    
    if (!service) {
      return NextResponse.json(
        { 
          success: false,
          error: '找不到指定的MCP服务' 
        },
        { status: 404 }
      );
    }
    
    // 返回找到的服务
    return NextResponse.json({
      success: true,
      data: service
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

// PUT: 更新特定MCP服务
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 解析请求体
    const body = await request.json();
    const serviceId = params.id;
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // 检查服务是否存在
    const service = findServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { 
          success: false,
          error: '找不到指定的MCP服务' 
        },
        { status: 404 }
      );
    }
    
    // 检查是否为系统预设服务
    if (service.isSystem) {
      return NextResponse.json(
        { 
          success: false,
          error: '不能修改系统预设服务' 
        },
        { status: 403 }
      );
    }
    
    // 更新服务（在实际应用中，这里应该更新数据库）
    const updatedService = {
      ...service,
      ...body,
      id: serviceId, // 保持ID不变
      updatedAt: Date.now(),
      isSystem: service.isSystem // 保持系统标志不变
    };
    
    // 返回更新后的服务
    return NextResponse.json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    console.error('更新MCP服务失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '更新MCP服务失败' 
      },
      { status: 500 }
    );
  }
}

// DELETE: 删除特定MCP服务
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // 检查服务是否存在
    const service = findServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { 
          success: false,
          error: '找不到指定的MCP服务' 
        },
        { status: 404 }
      );
    }
    
    // 检查是否为系统预设服务
    if (service.isSystem) {
      return NextResponse.json(
        { 
          success: false,
          error: '不能删除系统预设服务' 
        },
        { status: 403 }
      );
    }
    
    // 在实际应用中，这里应该从数据库中删除服务
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '成功删除MCP服务'
    });
  } catch (error) {
    console.error('删除MCP服务失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '删除MCP服务失败' 
      },
      { status: 500 }
    );
  }
} 