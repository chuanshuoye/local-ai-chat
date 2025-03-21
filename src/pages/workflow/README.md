# Workflow 模块

## 功能描述
Workflow 模块允许用户创建和管理自动化工作流程，将多个AI任务和操作连接成可重复执行的流程。用户可以定义触发条件、执行步骤和结果处理方式，实现复杂的自动化场景。

## 核心设计
- 可视化工作流编辑器
- 工作流模板库
- 工作流执行和监控
- 条件分支和循环支持
- 工作流历史和日志记录

## 技术实现
- 拖拽式界面设计 - 基于react-flow-renderer实现
- 工作流状态管理 - 采用Zustand进行状态管理
- 节点和连接的可视化表示
- 异步执行引擎

## 代码设计

### 数据模型

```typescript
// 工作流数据结构
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  nodeConfigs: Record<string, any>;
  agentId?: string; // 关联Agent ID
  type?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// 工作流节点数据类型
export interface FlowNodeData {
  label: string;
  type?: 'input' | 'output' | 'default' | 'agent' | 'custom';
  icon?: string;
  description?: string;
  [key: string]: any;
}
```

### 核心组件

#### 工作流编辑器

编辑器核心功能实现拖拽创建节点、连接节点、配置节点属性：

```typescript
export function WorkflowEditor({ agentId, workflowId, readOnly }) {
  // 处理拖放操作
  const onDrop = useCallback((event) => {
    const templateId = event.dataTransfer.getData('application/reactflow');
    const template = nodeTemplates.find(t => t.id === templateId);
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    addNode(template, position);
  }, [addNode, reactFlowInstance]);

  // 保存工作流
  const handleSaveWorkflow = async () => {
    // 收集工作流数据并保存
    const workflow = await saveWorkflow(
      localWorkflowName, 
      localWorkflowDescription,
      agentId
    );
  };
}
```

#### 状态管理

采用Zustand进行状态管理，分离工作流、节点和Agent状态：

```typescript
// 流程图状态管理
export const useFlowStore = create<FlowState>()(
  persist(
    immer((set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      
      // 添加节点
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
              ...template.data
            }
          });
        });
      },
      
      // 节点连接
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
      }
    }))
  )
);
```

### 工作流管理

提供工作流的CRUD操作，支持与Agent关联：

```typescript
// 加载工作流列表
useEffect(() => {
  const loadData = async () => {
    await Promise.all([fetchWorkflows(), fetchAgents()]);
    
    // 处理工作流数据，添加代理信息
    const enrichedWorkflows = workflows.map(workflow => {
      let agentName, agentIcon;
      
      if (workflow.agentId) {
        const agent = agents.find(a => a.id === workflow.agentId);
        if (agent) {
          agentName = agent.name;
          agentIcon = agent.icon;
        }
      }
      
      return {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        agentName,
        agentIcon,
        updatedAt: new Date(workflow.updatedAt),
        nodeCount: workflow.nodes.length,
        edgeCount: workflow.edges.length,
      };
    });
  };
  
  loadData();
}, [fetchWorkflows, fetchAgents]);
``` 