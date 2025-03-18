import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Message } from '@/components/chat/chat-message';
import { ASSISTANT_TYPES, MessageRole, STORAGE_KEYS, DEFAULT_MODEL_ID } from '@/constants';

// 定义助手类型
export interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string; // 角色描述提示词
  createdAt: Date;
  updatedAt: Date;
  isSystem?: boolean; // 是否为系统预设助手
}

// 定义聊天会话类型
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  assistantId?: string; // 关联的助手ID
}

// 替换预设助手列表
const defaultAssistants: Assistant[] = ASSISTANT_TYPES.map(type => ({
  ...type,
  createdAt: new Date(),
  updatedAt: new Date(),
  isSystem: true
}));

// 定义存储状态类型
interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  assistants: Assistant[];
  showAssistantsPanel: boolean;
  selectedModel: string;
  streamingEnabled: boolean;
  
  // 会话相关方法
  createSession: (title?: string, assistantId?: string) => string;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;
  
  // 消息相关方法
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, content: string, metadata?: Record<string, any>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  
  // 助手相关方法
  addAssistant: (assistant: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAssistant: (assistantId: string, updates: Partial<Omit<Assistant, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>>) => void;
  deleteAssistant: (assistantId: string) => void;
  toggleAssistantsPanel: () => void;
  
  // 获取方法
  getCurrentSession: () => ChatSession | undefined;
  getSession: (sessionId: string) => ChatSession | undefined;
  getAssistant: (assistantId: string) => Assistant | undefined;
  
  // 设置模型和流式选项
  setModelSettings: (model: string, streaming: boolean) => void;
}

// 创建存储
export const useChatStore = create<ChatState>()(
  persist(
    immer((set, get) => ({
      sessions: [],
      currentSessionId: null,
      assistants: [...defaultAssistants],
      showAssistantsPanel: true,
      selectedModel: DEFAULT_MODEL_ID,
      streamingEnabled: true,
      
      // 创建新会话
      createSession: (title = '新对话', assistantId) => {
        const id = Date.now().toString();
        const assistant = assistantId ? get().getAssistant(assistantId) : undefined;
        
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant' as MessageRole,
          content: assistant 
            ? `你好！我是${assistant.name}。${assistant.description}。有什么我可以帮助你的吗？` 
            : '你好！我是 AI 助手，有什么我可以帮助你的吗？',
          timestamp: new Date(),
          metadata: assistant ? { model: 'assistant', assistantId: assistant.id } : undefined
        };
        
        const newSession: ChatSession = {
          id,
          title: assistant ? `与${assistant.name}的对话` : title,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [welcomeMessage],
          assistantId
        };
        
        set(state => {
          state.sessions.unshift(newSession);
          state.currentSessionId = id;
        });
        
        return id;
      },
      
      // 删除会话
      deleteSession: (sessionId) => {
        set(state => {
          const index = state.sessions.findIndex(s => s.id === sessionId);
          if (index !== -1) {
            state.sessions.splice(index, 1);
            
            // 如果删除的是当前会话，重置当前会话ID
            if (state.currentSessionId === sessionId) {
              state.currentSessionId = state.sessions.length > 0 ? state.sessions[0].id : null;
            }
          }
        });
      },
      
      // 设置当前会话
      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },
      
      // 添加消息
      addMessage: (sessionId, message) => {
        set(state => {
          const session = state.sessions.find(s => s.id === sessionId);
          if (session) {
            session.messages.push(message);
            session.updatedAt = new Date();
            
            // 如果是用户消息，可以更新会话标题（取前20个字符）
            if (message.role === 'user' && session.title === '新对话' && message.content.trim()) {
              session.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '');
            }
          }
        });
      },
      
      // 更新消息
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
              session.updatedAt = new Date();
            }
          }
        });
      },
      
      // 删除消息
      deleteMessage: (sessionId, messageId) => {
        set(state => {
          const session = state.sessions.find(s => s.id === sessionId);
          if (session) {
            const index = session.messages.findIndex(m => m.id === messageId);
            if (index !== -1) {
              session.messages.splice(index, 1);
              session.updatedAt = new Date();
            }
          }
        });
      },
      
      // 添加助手
      addAssistant: (assistant) => {
        const id = `custom-${Date.now()}`;
        const now = new Date();
        
        const newAssistant: Assistant = {
          ...assistant,
          id,
          createdAt: now,
          updatedAt: now
        };
        
        set(state => {
          state.assistants.push(newAssistant);
        });
        
        return id;
      },
      
      // 更新助手
      updateAssistant: (assistantId, updates) => {
        set(state => {
          const assistant = state.assistants.find(a => a.id === assistantId);
          if (assistant && !assistant.isSystem) {
            Object.assign(assistant, updates, { updatedAt: new Date() });
          }
        });
      },
      
      // 删除助手
      deleteAssistant: (assistantId) => {
        set(state => {
          const index = state.assistants.findIndex(a => a.id === assistantId && !a.isSystem);
          if (index !== -1) {
            state.assistants.splice(index, 1);
          }
        });
      },
      
      // 切换助手面板显示状态
      toggleAssistantsPanel: () => {
        set(state => {
          state.showAssistantsPanel = !state.showAssistantsPanel;
        });
      },
      
      // 获取当前会话
      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find(s => s.id === currentSessionId);
      },
      
      // 获取指定会话
      getSession: (sessionId) => {
        return get().sessions.find(s => s.id === sessionId);
      },
      
      // 获取指定助手
      getAssistant: (assistantId) => {
        return get().assistants.find(a => a.id === assistantId);
      },
      
      // 设置模型和流式选项
      setModelSettings: (model: string, streaming: boolean) => {
        set({ selectedModel: model, streamingEnabled: streaming });
      }
    })),
    {
      name: STORAGE_KEYS.CHAT, // 使用常量
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        assistants: state.assistants,
        showAssistantsPanel: state.showAssistantsPanel,
        selectedModel: state.selectedModel,
        streamingEnabled: state.streamingEnabled,
      }),
    }
  )
); 