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
  context?: number[]; // 添加会话上下文
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
  clearAllSessions: () => void;
  setCurrentSession: (sessionId: string) => void;
  
  // 消息相关方法
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, content: string, metadata?: Record<string, any>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  
  // 上下文相关方法
  updateSessionContext: (sessionId: string, context: number[]) => void;
  
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
    (set, get) => ({
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
        
        set((state) => ({
          ...state,
          sessions: [newSession, ...state.sessions],
          currentSessionId: id
        }));
        
        return id;
      },
      
      // 删除会话
      deleteSession: (sessionId) => {
        set((state) => {
          const index = state.sessions.findIndex(s => s.id === sessionId);
          if (index !== -1) {
            const newSessions = [...state.sessions];
            newSessions.splice(index, 1);
            
            // 如果删除的是当前会话，重置当前会话ID
            const newCurrentSessionId = 
              state.currentSessionId === sessionId
                ? (newSessions.length > 0 ? newSessions[0].id : null)
                : state.currentSessionId;
                
            return {
              ...state,
              sessions: newSessions,
              currentSessionId: newCurrentSessionId
            };
          }
          return state;
        });
      },
      
      // 清除所有会话
      clearAllSessions: () => {
        set((state) => ({
          ...state,
          sessions: [],
          currentSessionId: null
        }));
      },
      
      // 设置当前会话
      setCurrentSession: (sessionId) => {
        set((state) => ({ ...state, currentSessionId: sessionId }));
      },
      
      // 添加消息
      addMessage: (sessionId, message) => {
        set((state) => {
          const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
          if (sessionIndex !== -1) {
            const newSessions = [...state.sessions];
            const session = { ...newSessions[sessionIndex] };
            
            session.messages = [...session.messages, message];
            session.updatedAt = new Date();
            
            // 如果是用户消息，可以更新会话标题（取前20个字符）
            if (message.role === 'user' && session.title === '新对话' && message.content.trim()) {
              session.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '');
            }
            
            newSessions[sessionIndex] = session;
            
            return {
              ...state,
              sessions: newSessions
            };
          }
          return state;
        });
      },
      
      // 更新消息
      updateMessage: (sessionId, messageId, content, metadata) => {
        set((state) => {
          const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
          if (sessionIndex !== -1) {
            const newSessions = [...state.sessions];
            const session = { ...newSessions[sessionIndex] };
            const messageIndex = session.messages.findIndex(m => m.id === messageId);
            
            if (messageIndex !== -1) {
              const newMessages = [...session.messages];
              const message = { ...newMessages[messageIndex] };
              
              message.content = content;
              if (metadata) {
                message.metadata = { ...message.metadata, ...metadata };
              }
              
              newMessages[messageIndex] = message;
              session.messages = newMessages;
              session.updatedAt = new Date();
              
              newSessions[sessionIndex] = session;
              
              return {
                ...state,
                sessions: newSessions
              };
            }
          }
          return state;
        });
      },
      
      // 删除消息
      deleteMessage: (sessionId, messageId) => {
        set((state) => {
          const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
          if (sessionIndex !== -1) {
            const newSessions = [...state.sessions];
            const session = { ...newSessions[sessionIndex] };
            const messageIndex = session.messages.findIndex(m => m.id === messageId);
            
            if (messageIndex !== -1) {
              const newMessages = [...session.messages];
              newMessages.splice(messageIndex, 1);
              
              session.messages = newMessages;
              session.updatedAt = new Date();
              
              newSessions[sessionIndex] = session;
              
              return {
                ...state,
                sessions: newSessions
              };
            }
          }
          return state;
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
        
        set((state) => ({
          ...state,
          assistants: [...state.assistants, newAssistant]
        }));
        
        return id;
      },
      
      // 更新助手
      updateAssistant: (assistantId, updates) => {
        set((state) => {
          const assistantIndex = state.assistants.findIndex(a => a.id === assistantId);
          if (assistantIndex !== -1 && !state.assistants[assistantIndex].isSystem) {
            const newAssistants = [...state.assistants];
            const assistant = { ...newAssistants[assistantIndex] };
            
            Object.assign(assistant, updates, { updatedAt: new Date() });
            newAssistants[assistantIndex] = assistant;
            
            return {
              ...state,
              assistants: newAssistants
            };
          }
          return state;
        });
      },
      
      // 删除助手
      deleteAssistant: (assistantId) => {
        set((state) => {
          const assistantIndex = state.assistants.findIndex(a => a.id === assistantId && !a.isSystem);
          if (assistantIndex !== -1) {
            const newAssistants = [...state.assistants];
            newAssistants.splice(assistantIndex, 1);
            
            return {
              ...state,
              assistants: newAssistants
            };
          }
          return state;
        });
      },
      
      // 切换助手面板显示状态
      toggleAssistantsPanel: () => {
        set((state) => ({
          ...state,
          showAssistantsPanel: !state.showAssistantsPanel
        }));
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
        set((state) => ({
          ...state,
          selectedModel: model,
          streamingEnabled: streaming
        }));
      },
      
      // 更新会话上下文
      updateSessionContext: (sessionId, context) => {
        set((state) => {
          const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
          if (sessionIndex !== -1) {
            const newSessions = [...state.sessions];
            const session = { ...newSessions[sessionIndex] };
            
            session.context = context;
            session.updatedAt = new Date();
            
            newSessions[sessionIndex] = session;
            
            return {
              ...state,
              sessions: newSessions
            };
          }
          return state;
        });
      }
    }),
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