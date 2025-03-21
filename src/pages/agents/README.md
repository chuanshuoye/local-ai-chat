# Agents 模块

## 功能描述
Agents 模块提供智能代理功能，这些代理可以执行特定任务或解决特定领域问题。用户可以创建、配置和管理不同类型的AI代理，使其执行复杂的自动化任务。

## 核心设计
- 代理创建和配置接口
- 代理执行状态监控
- 支持多种代理类型和能力
- 代理任务历史记录和结果展示
- 代理知识库和技能集管理

## 技术实现
- 模块化代理架构设计
- 基于React的交互式配置界面
- 任务执行和状态管理
- 代理相关数据的持久化存储

## 代码设计思路

### 1. 数据模型设计

Agent数据模型采用以下结构，具有明确的属性和关联关系：

```typescript
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
```

### 2. 状态管理架构

使用Zustand进行全局状态管理，结合immer实现不可变数据更新，通过persist中间件实现本地持久化：

```typescript
export const useAgentStore = create<AgentState>()(
  persist(
    immer((set, get) => ({
      agents: [],
      selectedAgentId: null,
      isLoading: false,
      error: null,
      
      // CRUD操作
      fetchAgents: async () => { /* ... */ },
      addAgent: async (agentData) => { /* ... */ },
      removeAgent: async (id) => { /* ... */ },
      updateAgent: async (id, updates) => { /* ... */ },
      
      // UI状态管理
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
```

### 3. 工作流集成

Agent模块与工作流模块紧密集成，通过工作流ID关联，实现复杂的任务编排：

```typescript
// 保存工作流并关联到Agent
saveWorkflow: async (name, description, agentId) => {
  // ...
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
  // ...
}
```

### 4. 组件化UI设计

采用组件化设计，如AgentCard组件负责Agent的展示和操作：

```tsx
export function AgentCard({ agent, onEdit, onDelete, onWorkflow }: AgentCardProps) {
  // 获取Agent关联的工作流信息
  useEffect(() => {
    if (agent.workflowId) {
      const workflow = workflows.find(w => w.id === agent.workflowId);
      if (workflow) {
        setAgentWorkflow({
          name: workflow.name
        });
      }
    } else {
      setAgentWorkflow(null);
    }
  }, [agent.workflowId, workflows]);
  
  // 处理工作流按钮点击
  const handleWorkflowClick = (e: React.MouseEvent, agent: Agent) => {
    // ...
    if (onWorkflow) {
      onWorkflow(agent);
    } else {
      navigate(`/workflow?agent=${agent.id}`);
    }
  };
  
  // ...
}
```

### 5. 多页面路由结构

使用React Router实现页面导航，支持Agent的创建、编辑和工作流关联：

```tsx
export default function AgentsPage() {
  const { agents, fetchAgents, removeAgent, isLoading, error } = useAgentStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
  
  // 处理编辑Agent
  const handleEdit = (agent: Agent) => {
    navigate(`/agents/${agent.id}`);
  };
  
  // 处理工作流
  const handleWorkflow = (agent: Agent) => {
    navigate(`/workflow?agent=${agent.id}`);
  };
  
  // ...
}
``` 