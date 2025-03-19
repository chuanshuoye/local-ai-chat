/**
 * 应用常量定义
 */

// AI 模型定义
export const AI_MODELS = [
  { id: 'llama3.2', name: 'llama 3.2', description: '高性能通用大语言模型' },
  { id: 'deepseek-coder-v2', name: 'deepseek-coder-v2', description: 'deepseek高效开源语言模型' },
  { id: 'deepseek-r1:8b', name: 'deepseek-r1:8b', description: '高效开源语言模型' },
  { id: 'deepseek-r1:14b', name: 'deepseek-r1:14b', description: 'Deepseek开源模型' },
];

// MCP服务定义
export const MCP_SERVICES = [
  { id: 'mcp-1', name: '文本分析', description: '提供文本分析、分类和情感分析服务', icon: '📊' },
  { id: 'mcp-2', name: '代码生成', description: '提供代码生成和代码转换服务', icon: '💻' },
  { id: 'mcp-3', name: '图像识别', description: '提供图像识别和分类服务', icon: '🖼️' },
  { id: 'mcp-4', name: '自然语言理解', description: '提供语义理解和实体识别服务', icon: '🔍' },
  { id: 'mcp-5', name: '知识图谱', description: '提供知识图谱构建和查询服务', icon: '🌐' },
];

// 默认模型ID
export const DEFAULT_MODEL_ID = 'llama3.2';

// 默认MCP服务ID
export const DEFAULT_MCP_SERVICE_ID = 'mcp-1';

// 助手类型定义
export const ASSISTANT_TYPES = [
  {
    id: 'general',
    name: '通用助手',
    description: '回答各类问题，提供全面帮助',
    icon: '🤖',
    prompt: '你是一个乐于助人的AI助手，可以回答用户各种问题并提供帮助。'
  },
  {
    id: 'code',
    name: '代码专家',
    description: '编程问题解答与代码优化',
    icon: '👨‍💻',
    prompt: '你是一个编程专家，擅长解决各种编程问题，提供代码示例和优化建议。'
  },
  {
    id: 'writing',
    name: '写作助手',
    description: '帮助改进文章和创意写作',
    icon: '✍️',
    prompt: '你是一个写作助手，可以帮助用户改进文章，提供创意写作建议，以及纠正语法错误。'
  },
  {
    id: 'math',
    name: '数学导师',
    description: '解决数学问题和概念解释',
    icon: '🧮',
    prompt: '你是一个数学导师，擅长解决各种数学问题，解释数学概念，并提供详细的解题步骤。'
  },
  {
    id: 'travel',
    name: '旅行顾问',
    description: '提供旅行建议和行程规划',
    icon: '🧳',
    prompt: '你是一个旅行顾问，可以提供旅行建议、行程规划、景点推荐和旅行小贴士。'
  }
];

// 可用的表情图标列表
export const AVAILABLE_ICONS = ['🤖', '👨‍💻', '✍️', '🧮', '🧳', '🎨', '🎓', '📊', '🔍', '💼', '🏥', '🍳', '🎮', '📝', '🖼️', '🌐', '💻'];

// 本地存储键名
export enum STORAGE_KEYS {
  CHAT = 'chat-storage',
  FLOW = 'flow-storage',
  AGENT = 'agent-storage',
  WORKFLOW = 'workflow-storage',
  MCP = 'mcp-storage'
}

// API 路径
export const API_PATHS = {
  OLLAMA: '/api/ai/ollama',
  MCP: '/api/mcp'
};

// 消息角色
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
} 