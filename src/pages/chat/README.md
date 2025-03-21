# Chat 模块

## 功能描述
Chat 模块是应用程序的核心聊天界面，允许用户与AI助手进行交互。该模块处理消息的发送和接收、聊天历史记录的管理以及不同AI模型的集成。

## 核心设计
- 实时消息交互界面
- 支持多种AI模型的对话
- 聊天历史记录的保存和检索
- 消息流式传输和渲染
- 聊天会话管理（创建、切换、删除）
- 用户偏好设置（如模型选择、温度参数等）

## 技术实现
- React 函数式组件结构
- Tailwind CSS 用于界面样式设计
- 使用 React Server Components 优化性能
- radix-ui 组件库用于高级UI元素 

## 关键设计思路与代码实现

### 状态管理
使用 Zustand 实现全局状态管理，通过 immer 提供不可变更新，通过 persist 实现本地持久化：

```typescript
// src/store/chat-store.ts
export const useChatStore = create<ChatState>()(
  persist(
    immer((set, get) => ({
      sessions: [],
      currentSessionId: null,
      // ...其他状态
      
      // 添加消息
      addMessage: (sessionId, message) => {
        set(state => {
          const session = state.sessions.find(s => s.id === sessionId);
          if (session) {
            session.messages.push(message);
            session.updatedAt = new Date();
            
            // 自动设置会话标题
            if (message.role === 'user' && session.title === '新对话' && message.content.trim()) {
              session.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '');
            }
          }
        });
      },
      
      // 更新消息（用于流式响应）
      updateMessage: (sessionId, messageId, content, metadata) => {
        set(state => {
          const session = state.sessions.find(s => s.id === sessionId);
          if (session) {
            const message = session.messages.find(m => m.id === messageId);
            if (message) {
              message.content = content;
              if (metadata) {
                message.metadata = { ...message.metadata, ...metadata };
              }
            }
          }
        });
      }
    })),
    {
      name: STORAGE_KEYS.CHAT,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

### 流式消息处理
实现了基于 SSE（Server-Sent Events）的流式消息处理机制：

```typescript
// src/utils/api-helpers.ts
export async function handleStreamingResponse(
  apiPath: string,
  requestData: any,
  chatId: string,
  messageId: string,
  modelId: string,
  callbacks: {
    updateMessage: (sessionId: string, messageId: string, content: string, metadata?: Record<string, any>) => void,
    updateSessionContext: (sessionId: string, context: number[]) => void
  }
) {
  const response = await fetch(apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedContent = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const { validLines, remaining } = extractValidJsonLines(chunk);
    
    for (const data of validLines) {
      accumulatedContent = processResponseData(
        data, accumulatedContent, chatId, messageId, 
        callbacks.updateMessage, callbacks.updateSessionContext, modelId
      );
    }
  }
}
```

### 消息展示组件
消息组件支持代码高亮、markdown渲染、文件附件和语音朗读：

```typescript
// src/components/chat/chat-message.tsx
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === MessageRole.USER;
  const isStreaming = message.metadata?.isStreaming || false;
  
  // 渲染消息内容，处理代码块
  const renderMessageContent = (content: string) => {
    if (!content) {
      if (isStreaming) {
        return <span className="animate-pulse">▋</span>;
      }
      return <span>...</span>;
    }
    
    // 匹配代码块并渲染
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    const parts = [];
    // ... 代码块解析逻辑
    
    return parts;
  };
  
  return (
    <div className={`py-5 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* 消息头部：用户/AI标识 */}
        {/* 消息内容 */}
        <div className="mt-1" ref={contentRef}>
          {renderMessageContent(parsedContent)}
        </div>
        {/* 附件处理 */}
      </div>
    </div>
  );
}
```

### 交互流程设计
聊天会话页面控制消息发送、接收和处理流程：

```typescript
// src/pages/chat/[id].tsx
const handleSendMessage = async (content: string) => {
  // 创建用户消息
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: MessageRole.USER,
    content,
    timestamp: new Date(),
  };
  
  // 添加到聊天记录
  addMessage(chatId, userMessage);
  setIsLoading(true);
  
  try {
    // 获取会话历史
    const history = session.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // 准备请求数据
    const requestData = createRequestData(
      content, history, selectedModel, streamingEnabled, 
      session.context, assistant?.prompt
    );
    
    // 创建初始AI响应消息
    if (streamingEnabled) {
      const aiResponse = createInitialAiMessage(selectedModel, assistant);
      addMessage(chatId, aiResponse);
      
      // 处理流式响应
      await handleStreamingResponse(
        API_PATHS.OLLAMA,
        requestData,
        chatId,
        aiResponse.id,
        selectedModel,
        { updateMessage, updateSessionContext }
      );
    } else {
      // 处理非流式响应
      await handleNonStreamingResponse(
        API_PATHS.OLLAMA,
        requestData,
        chatId,
        assistant,
        { addMessage, updateSessionContext }
      );
    }
  } catch (error) {
    // 错误处理
  } finally {
    setIsLoading(false);
  }
};
```

### 助手与模型管理
支持预设和自定义助手角色，以及多种大语言模型：

```typescript
// src/constants/index.ts
export const AI_MODELS = [
  { id: 'llama3.2', name: 'llama 3.2', description: '高性能通用大语言模型' },
  { id: 'deepseek-coder-v2', name: 'deepseek-coder-v2', description: 'deepseek高效开源语言模型' },
  { id: 'deepseek-r1:8b', name: 'deepseek-r1:8b', description: '高效开源语言模型' },
  { id: 'deepseek-r1:14b', name: 'deepseek-r1:14b', description: 'Deepseek开源模型' },
];

export const ASSISTANT_TYPES = [
  {
    id: 'general',
    name: '通用助手',
    description: '回答各类问题，提供全面帮助',
    icon: '🤖',
    prompt: '你是一个乐于助人的AI助手，可以回答用户各种问题并提供帮助。'
  },
  // 其他助手类型...
];
``` 