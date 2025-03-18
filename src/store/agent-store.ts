import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEYS } from '@/constants';
import { Node, Edge } from 'react-flow-renderer';
import { FlowNodeData } from './flow-store';

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  prompt: string;
  createdAt: number;
  updatedAt?: number;
  // 工作流数据
  workflow?: AgentWorkflow;
}

// 工作流数据结构
export interface AgentWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  nodeConfigs: Record<string, any>; // 存储每个节点的配置数据
  updatedAt: number;
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
  
  // 工作流操作
  saveAgentWorkflow: (agentId: string, name: string, description?: string) => Promise<void>;
  loadAgentWorkflow: (workflowId: string) => void;
  getAgentWorkflows: () => AgentWorkflow[];
  
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

      // 保存Agent工作流
      saveAgentWorkflow: async (agentId, name, description) => {
        set({ isLoading: true, error: null });
        try {
          // 获取当前工作流数据
          const { useFlowStore } = require('./flow-store');
          const { useNodeStore } = require('./node-store');
          
          const { nodes, edges } = useFlowStore.getState();
          
          // 收集所有节点的配置数据
          const nodeConfigs: Record<string, any> = {};
          
          // 为每个节点收集其配置数据
          for (const node of nodes) {
            // 打开节点配置抽屉
            useNodeStore.getState().openDrawer(node.id, node.data);
            // 获取表单数据
            const formData = useNodeStore.getState().formData;
            // 保存节点配置
            nodeConfigs[node.id] = { ...formData };
            // 关闭抽屉
            useNodeStore.getState().closeDrawer();
          }
          
          // 创建工作流对象
          const workflow: AgentWorkflow = {
            id: `workflow-${Date.now()}`,
            name,
            description,
            nodes,
            edges,
            nodeConfigs,
            updatedAt: Date.now()
          };
          
          // 更新agent的工作流
          const agent = get().agents.find(a => a.id === agentId);
          if (!agent) {
            throw new Error('找不到指定的Agent');
          }
          
          // 保存工作流到Agent
          const updatedAgent = {
            ...agent,
            workflow,
            updatedAt: Date.now()
          };
          
          // 调用API保存
          const response = await fetch(`/api/agents/${agentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAgent)
          });
          
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              const agent = state.agents.find(a => a.id === agentId);
              if (agent) {
                agent.workflow = workflow;
                agent.updatedAt = Date.now();
              }
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '保存工作流失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
          throw err;
        }
      },
      
      // 加载工作流到编辑器
      loadAgentWorkflow: (agentId) => {
        try {
          const agent = get().agents.find(a => a.id === agentId);
          if (!agent || !agent.workflow) {
            throw new Error('找不到指定的工作流');
          }
          
          const { useFlowStore } = require('./flow-store');
          const { nodes, edges, nodeConfigs } = agent.workflow;
          
          // 加载工作流到编辑器
          useFlowStore.getState().setNodes(nodes);
          useFlowStore.getState().setEdges(edges);
          
          // 加载节点配置
          for (const nodeId in nodeConfigs) {
            const nodeData = nodes.find(n => n.id === nodeId)?.data;
            if (nodeData) {
              useFlowStore.getState().updateNodeData(nodeId, {
                ...nodeData,
                ...nodeConfigs[nodeId]
              });
            }
          }
          
          return agent.workflow;
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
          });
          throw err;
        }
      },
      
      // 获取所有工作流
      getAgentWorkflows: () => {
        const workflows: AgentWorkflow[] = [];
        
        get().agents.forEach(agent => {
          if (agent.workflow) {
            workflows.push(agent.workflow);
          }
        });
        
        return workflows;
      },

      setSelectedAgent: (id) => set({ selectedAgentId: id }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    })),
    {
      name: STORAGE_KEYS.AGENT,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        agents: state.agents.map(agent => ({
          ...agent,
          // 确保工作流数据也被持久化
          workflow: agent.workflow
        })),
        selectedAgentId: state.selectedAgentId,
      }),
    }
  )
); 