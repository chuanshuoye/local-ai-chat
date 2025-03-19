import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEYS } from '@/constants';
import { Node, Edge } from 'react-flow-renderer';
import { FlowNodeData } from './flow-store';
import { useFlowStore } from './flow-store';
import { useNodeStore } from './node-store';
import { useAgentStore } from './agent-store';

// 工作流数据结构
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  nodeConfigs: Record<string, any>; // 存储每个节点的配置数据
  agentId?: string; // 关联的Agent ID (可选)
  type?: string; // 工作流类型
  tags?: string[]; // 标签
  createdAt: number;
  updatedAt: number;
}

interface WorkflowState {
  workflows: Workflow[];
  selectedWorkflowId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD 操作
  fetchWorkflows: () => Promise<void>;
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workflow>;
  removeWorkflow: (id: string) => Promise<void>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;
  
  // 工作流操作
  saveWorkflow: (name: string, description?: string, agentId?: string) => Promise<Workflow>;
  loadWorkflow: (workflowId: string) => Promise<Workflow>;
  getWorkflowsByAgentId: (agentId: string) => Workflow[];
  
  // UI 状态
  setSelectedWorkflow: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    immer((set, get) => ({
      workflows: [],
      selectedWorkflowId: null,
      isLoading: false,
      error: null,

      fetchWorkflows: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/workflows');
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              state.workflows = result.data;
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '获取工作流列表失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
        }
      },

      addWorkflow: async (workflowData) => {
        set({ isLoading: true, error: null });
        try {
          const newWorkflow: Workflow = {
            ...workflowData,
            id: `workflow-${Date.now()}`,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          
          const response = await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newWorkflow)
          });
          
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              state.workflows.push(result.data);
              state.isLoading = false;
            });
            return result.data;
          } else {
            throw new Error(result.error || '创建工作流失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
          throw err;
        }
      },

      removeWorkflow: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/workflows/${id}`, {
            method: 'DELETE'
          });
          
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              state.workflows = state.workflows.filter(w => w.id !== id);
              if (state.selectedWorkflowId === id) {
                state.selectedWorkflowId = null;
              }
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '删除工作流失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
          throw err;
        }
      },

      updateWorkflow: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const workflow = get().workflows.find(w => w.id === id);
          if (!workflow) {
            throw new Error('找不到指定的工作流');
          }
          
          const updatedWorkflow = {
            ...workflow,
            ...updates,
            updatedAt: Date.now()
          };
          
          const response = await fetch(`/api/workflows/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedWorkflow)
          });
          
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              const index = state.workflows.findIndex(w => w.id === id);
              if (index !== -1) {
                state.workflows[index] = result.data;
              }
              state.isLoading = false;
            });
          } else {
            throw new Error(result.error || '更新工作流失败');
          }
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
            state.isLoading = false;
          });
          throw err;
        }
      },
      
      // 保存工作流
      saveWorkflow: async (name, description, agentId) => {
        set({ isLoading: true, error: null });
        try {
          // 获取当前工作流数据
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
          const now = Date.now();
          const workflow: Workflow = {
            id: `workflow-${now}`,
            name,
            description,
            nodes,
            edges,
            nodeConfigs,
            agentId,
            createdAt: now,
            updatedAt: now
          };
          
          // 保存工作流到存储
          const response = await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflow)
          });
          
          const result = await response.json();
          
          if (result.success) {
            set(state => {
              state.workflows.push(workflow);
              state.isLoading = false;
            });
            
            // 如果提供了agentId，则同时更新Agent的工作流关联
            if (agentId) {
              try {
                const { updateAgent } = useAgentStore.getState();
                await updateAgent(agentId, { 
                  workflowId: workflow.id,
                  updatedAt: Date.now()
                });
              } catch (err) {
                console.error('更新Agent工作流关联失败:', err);
              }
            }
            
            return workflow;
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
      loadWorkflow: async (workflowId) => {
        try {
          const workflow = get().workflows.find(w => w.id === workflowId);
          if (!workflow) {
            // 如果本地没有找到，尝试从服务器获取
            const response = await fetch(`/api/workflows/${workflowId}`);
            const result = await response.json();
            
            if (!result.success || !result.data) {
              throw new Error('找不到指定的工作流');
            }
            
            set(state => {
              state.workflows.push(result.data);
            });
            
            return result.data;
          }
          
          const { nodes, edges, nodeConfigs } = workflow;
          
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
          
          return workflow;
        } catch (err) {
          set(state => {
            state.error = err instanceof Error ? err.message : '未知错误';
          });
          throw err;
        }
      },
      
      // 根据AgentId获取工作流
      getWorkflowsByAgentId: (agentId) => {
        return get().workflows.filter(workflow => workflow.agentId === agentId);
      },

      setSelectedWorkflow: (id) => set({ selectedWorkflowId: id }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    })),
    {
      name: STORAGE_KEYS.WORKFLOW,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workflows: state.workflows,
        selectedWorkflowId: state.selectedWorkflowId,
      }),
    }
  )
); 