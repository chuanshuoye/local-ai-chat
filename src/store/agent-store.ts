import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEYS } from '@/constants';

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  prompt: string;
  createdAt: number;
  updatedAt?: number;
  // 工作流引用
  workflowId?: string;
}

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD 操作
  fetchAgents: () => Promise<void>;
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt'>) => Promise<Agent>;
  removeAgent: (id: string) => Promise<void>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  
  // UI 状态
  setSelectedAgent: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    immer((set, get) => ({
      agents: [],
      selectedAgentId: null,
      isLoading: false,
      error: null,

      fetchAgents: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/agents');
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              state.agents = result.data;
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '获取Agent列表失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
        }
      },

      addAgent: async (agentData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentData)
          });
          
          const result = await response.json();
          
          if (result.success) {
            const newAgent = result.data;
            set(state => {
              state.agents.push(newAgent);
              state.isLoading = false;
            });
            return newAgent;
          } else {
            throw new Error(result.error || '创建Agent失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
          throw err;
        }
      },

      removeAgent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/agents/${id}`, {
            method: 'DELETE'
          });
          
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              state.agents = state.agents.filter(a => a.id !== id);
              if (state.selectedAgentId === id) {
                state.selectedAgentId = null;
              }
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '删除Agent失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
          throw err;
        }
      },

      updateAgent: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/agents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              const agent = state.agents.find(a => a.id === id);
              if (agent) {
                Object.assign(agent, result.data);
              }
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '更新Agent失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
          throw err;
        }
      },

      setSelectedAgent: (id) => set({ selectedAgentId: id }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    })),
    {
      name: STORAGE_KEYS.AGENT,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        agents: state.agents,
        selectedAgentId: state.selectedAgentId,
      }),
    }
  )
); 