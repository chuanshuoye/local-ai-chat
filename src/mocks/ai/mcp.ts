import { HttpResponse, type HttpResponseResolver } from 'msw';
import { MCP_SERVICES } from '@/constants';

// MCP服务的接口定义
interface MCPService {
  id: string;
  name: string;
  description: string;
  icon: string;
  endpoint?: string;
  apiKey?: string;
  parameters?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  isSystem?: boolean;
}

// 创建MCP服务的请求体类型
interface CreateMCPServiceBody {
  name: string;
  description: string;
  icon?: string;
  endpoint?: string;
  apiKey?: string;
  parameters?: Record<string, any>;
}

// 模拟API响应延迟
const MOCK_DELAY = 500;

// 模拟MCP服务数据
const mockMCPServices = MCP_SERVICES.map(service => ({
  ...service,
  createdAt: Date.now() - Math.floor(Math.random() * 10000000),
  updatedAt: Date.now() - Math.floor(Math.random() * 1000000),
  isSystem: true
})) as MCPService[];

// 添加一些自定义服务示例
const customMCPServices: MCPService[] = [
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
const getAllServices = (): MCPService[] => {
  return [...mockMCPServices, ...customMCPServices];
};

// 根据ID查找服务
const findServiceById = (id: string): MCPService | undefined => {
  return getAllServices().find(service => service.id === id);
};

// GET /api/mcp - 获取所有MCP服务
export const handleGetMCPServices: HttpResponseResolver = async () => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  // 合并预设和自定义服务
  const allServices = getAllServices();
  
  return HttpResponse.json({
    success: true,
    data: allServices
  });
};

// POST /api/mcp - 创建新的MCP服务
export const handleCreateMCPService: HttpResponseResolver = async ({ request }) => {
  const body = await request.json() as CreateMCPServiceBody;
  
  // 验证必要字段
  if (!body.name || !body.description) {
    return new HttpResponse(
      JSON.stringify({ 
        success: false,
        error: '缺少必要字段' 
      }),
      { status: 400 }
    );
  }
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  // 创建新服务
  const newService: MCPService = {
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
  
  return HttpResponse.json({
    success: true,
    data: newService
  }, { status: 201 });
};

// GET /api/mcp/:id - 获取特定MCP服务
export const handleGetMCPService: HttpResponseResolver = async ({ params }) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  const serviceId = params.id as string;
  const service = findServiceById(serviceId);
  
  if (!service) {
    return new HttpResponse(
      JSON.stringify({ 
        success: false,
        error: '找不到指定的MCP服务' 
      }),
      { status: 404 }
    );
  }
  
  return HttpResponse.json({
    success: true,
    data: service
  });
};

// PUT /api/mcp/:id - 更新特定MCP服务
export const handleUpdateMCPService: HttpResponseResolver = async ({ request, params }) => {
  const body = await request.json() as Partial<CreateMCPServiceBody>;
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  // 检查服务是否存在
  const serviceId = params.id as string;
  const service = findServiceById(serviceId);
  if (!service) {
    return new HttpResponse(
      JSON.stringify({ 
        success: false,
        error: '找不到指定的MCP服务' 
      }),
      { status: 404 }
    );
  }
  
  // 检查是否为系统预设服务
  if (service.isSystem) {
    return new HttpResponse(
      JSON.stringify({ 
        success: false,
        error: '不能修改系统预设服务' 
      }),
      { status: 403 }
    );
  }
  
  // 更新服务
  const updatedService: MCPService = {
    ...service,
    ...body,
    id: serviceId, // 保持ID不变
    updatedAt: Date.now(),
    isSystem: service.isSystem // 保持系统标志不变
  };
  
  return HttpResponse.json({
    success: true,
    data: updatedService
  });
};

// DELETE /api/mcp/:id - 删除特定MCP服务
export const handleDeleteMCPService: HttpResponseResolver = async ({ params }) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  // 检查服务是否存在
  const serviceId = params.id as string;
  const service = findServiceById(serviceId);
  if (!service) {
    return new HttpResponse(
      JSON.stringify({ 
        success: false,
        error: '找不到指定的MCP服务' 
      }),
      { status: 404 }
    );
  }
  
  // 检查是否为系统预设服务
  if (service.isSystem) {
    return new HttpResponse(
      JSON.stringify({ 
        success: false,
        error: '不能删除系统预设服务' 
      }),
      { status: 403 }
    );
  }
  
  return HttpResponse.json({
    success: true,
    message: '成功删除MCP服务'
  });
}; 