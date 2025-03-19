import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Node, Edge, NodeChange, EdgeChange, Connection, applyNodeChanges, applyEdgeChanges, addEdge } from 'react-flow-renderer';
import { STORAGE_KEYS } from '@/constants';

// 定义工作流节点数据类型
export interface FlowNodeData {
  label: string;
  type?: 'input' | 'output' | 'default' | 'agent' | 'multiagent' | 'custom';
  icon?: string;
  description?: string;
  [key: string]: any;
}

// 定义节点模板类型
export interface NodeTemplate {
  id: string;
  type: 'input' | 'output' | 'default' | 'agent' | 'multiagent' | 'custom';
  label: string;
  icon: string;
  description: string;
  nodeType?: string; // react-flow节点类型
  data?: Partial<FlowNodeData>;
}

// 默认节点模板
export const nodeTemplates: NodeTemplate[] = [
  {
    id: 'input',
    type: 'input',
    label: '开始节点',
    icon: '🚀',
    description: '工作流的起始节点',
    nodeType: 'custom',
  },
  {
    id: 'output',
    type: 'output',
    label: '结束节点',
    icon: '🏁',
    description: '工作流的结束节点',
    nodeType: 'custom',
  },
  {
    id: 'agent',
    type: 'agent',
    label: 'Agent节点',
    icon: '🤖',
    description: '执行AI助手任务',
    nodeType: 'custom',
    data: {
      agentId: '',
    }
  },
  {
    id: 'multiagent',
    type: 'multiagent',
    label: '多Agent节点',
    icon: '👥',
    description: '多个AI助手协作处理任务',
    nodeType: 'custom',
    data: {
      agentIds: [],
      maxRounds: 3,
    }
  },
  {
    id: 'condition',
    type: 'custom',
    label: '条件节点',
    icon: '🔀',
    description: '根据条件分支执行',
    nodeType: 'custom',
    data: {
      condition: '',
    }
  },
  {
    id: 'text',
    type: 'custom',
    label: '文本节点',
    icon: '📝',
    description: '显示或处理文本内容',
    nodeType: 'custom',
  }
];

// 定义初始节点
const initialNodes: Node<FlowNodeData>[] = [
  { 
    id: 'start',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { 
      label: '开始节点',
      type: 'input',
      icon: '🚀'
    }
  },
  { 
    id: 'end',
    type: 'custom',
    position: { x: 250, y: 250 },
    data: { 
      label: '结束节点',
      type: 'output',
      icon: '🏁'
    }
  }
];

const initialEdges: Edge[] = [
  { id: 'e-start-end', source: 'start', target: 'end' }
];

// 定义存储状态类型
interface FlowState {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  
  // 节点操作
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (nodeId: string | null) => void;
  
  // 添加新节点
  addNode: (template: NodeTemplate, position: { x: number, y: number }) => void;
  
  // 辅助方法
  getNode: (nodeId: string) => Node<FlowNodeData> | undefined;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  
  // 重置流程图
  resetFlow: () => void;
}

// 创建存储
export const useFlowStore = create<FlowState>()(
  persist(
    immer((set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      selectedNodeId: null,

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      
      onNodesChange: (changes) => {
        set(state => {
          state.nodes = applyNodeChanges(changes, state.nodes);
        });
      },
      
      onEdgesChange: (changes) => {
        set(state => {
          state.edges = applyEdgeChanges(changes, state.edges);
        });
      },

      onConnect: (connection) => {
        set(state => {
          state.edges = addEdge(
            { 
              ...connection, 
              id: `edge-${state.edges.length + 1}`,
              animated: true 
            },
            state.edges
          );
        });
      },

      setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
      
      addNode: (template, position) => {
        set(state => {
          const nodeId = `${template.id}-${Date.now()}`;
          state.nodes.push({
            id: nodeId,
            type: template.nodeType || 'default',
            position,
            data: {
              label: template.label,
              type: template.type,
              icon: template.icon,
              description: template.description,
              ...template.data
            }
          });
        });
      },
      
      getNode: (nodeId) => {
        return get().nodes.find(n => n.id === nodeId);
      },
      
      updateNodeData: (nodeId, data) => {
        set(state => {
          const node = state.nodes.find(n => n.id === nodeId);
          if (node) {
            node.data = { ...node.data, ...data };
          }
        });
      },
      
      resetFlow: () => {
        set({ nodes: initialNodes, edges: initialEdges });
      }
    })),
    {
      name: STORAGE_KEYS.FLOW,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges
      }),
    }
  )
); 