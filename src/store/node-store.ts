import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { FlowNodeData } from './flow-store';

// 表单字段类型
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'color';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  defaultValue?: any;
}

// 表单配置类型
export interface FormConfig {
  title: string;
  description?: string;
  fields: FormField[];
}

// 节点类型到表单配置的映射
const nodeFormConfigs: Record<string, FormConfig> = {
  input: {
    title: '开始节点配置',
    description: '工作流的起始节点，定义工作流的入口',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '节点名称',
        placeholder: '输入节点显示名称',
        required: true,
      },
      {
        id: 'description',
        type: 'textarea',
        label: '节点描述',
        placeholder: '描述这个节点的作用',
      },
    ],
  },
  output: {
    title: '结束节点配置',
    description: '工作流的结束节点，定义工作流的出口',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '节点名称',
        placeholder: '输入节点显示名称',
        required: true,
      },
      {
        id: 'description',
        type: 'textarea',
        label: '节点描述',
        placeholder: '描述这个节点的作用',
      },
      {
        id: 'outputFormat',
        type: 'select',
        label: '输出格式',
        options: [
          { label: '文本', value: 'text' },
          { label: 'JSON', value: 'json' },
          { label: 'HTML', value: 'html' },
        ],
      },
    ],
  },
  agent: {
    title: 'Agent节点配置',
    description: '执行AI助手任务',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '节点名称',
        placeholder: '输入节点显示名称',
        required: true,
      },
      {
        id: 'agentId',
        type: 'select',
        label: '选择Agent',
        placeholder: '选择要使用的Agent',
        required: true,
        options: [], // 这个会在运行时动态填充
      },
      {
        id: 'prompt',
        type: 'textarea',
        label: '追加提示词',
        placeholder: '可以在这里追加额外的提示词',
      },
      {
        id: 'temperature',
        type: 'number',
        label: '温度',
        min: 0,
        max: 1,
        defaultValue: 0.7,
        helpText: '数值越高，回复越随机',
      },
    ],
  },
  condition: {
    title: '条件节点配置',
    description: '根据条件分支执行不同的路径',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '节点名称',
        placeholder: '输入节点显示名称',
        required: true,
      },
      {
        id: 'condition',
        type: 'textarea',
        label: '条件表达式',
        placeholder: '输入条件表达式',
        required: true,
        helpText: '使用JavaScript表达式，如: value > 10 && value < 20',
      },
    ],
  },
  text: {
    title: '文本节点配置',
    description: '处理文本内容',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '节点名称',
        placeholder: '输入节点显示名称',
        required: true,
      },
      {
        id: 'text',
        type: 'textarea',
        label: '文本内容',
        placeholder: '输入文本内容',
      },
    ],
  },
  default: {
    title: '基础节点配置',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '节点名称',
        placeholder: '输入节点显示名称',
        required: true,
      },
    ],
  },
};

// 存储类型
interface NodeState {
  isDrawerOpen: boolean;
  selectedNodeId: string | null;
  selectedNodeData: FlowNodeData | null;
  
  // 表单相关
  formConfig: FormConfig | null;
  formData: Record<string, any>;
  
  // 操作方法
  openDrawer: (nodeId: string, nodeData: FlowNodeData) => void;
  closeDrawer: () => void;
  updateFormData: (fieldId: string, value: any) => void;
  getFormConfigForNodeType: (nodeType: string) => FormConfig;
  applyChanges: () => void;
}

export const useNodeStore = create<NodeState>()(
  immer((set, get) => ({
    isDrawerOpen: false,
    selectedNodeId: null,
    selectedNodeData: null,
    formConfig: null,
    formData: {},
    
    openDrawer: (nodeId, nodeData) => {
      set(state => {
        // 获取该节点类型的表单配置
        const nodeType = nodeData.type || 'default';
        
        // 深拷贝表单配置，以便可以安全修改
        const formConfig = JSON.parse(JSON.stringify(get().getFormConfigForNodeType(nodeType)));
        
        // 如果是agent类型，动态填充Agent选项
        if (nodeType === 'agent' as string) {
          const { agents } = require('./agent-store').useAgentStore.getState();
          const agentField = formConfig.fields.find((f: FormField) => f.id === 'agentId');
          if (agentField && agents) {
            agentField.options = agents.map((a: any) => ({
              label: a.name,
              value: a.id
            }));
          }
          
          // 补充agent节点的其他配置项
          const temperatureField = formConfig.fields.find((f: FormField) => f.id === 'temperature');
          if (temperatureField) {
            temperatureField.min = 0;
            temperatureField.max = 1;
            temperatureField.step = 0.1;
          }
          
          // 设置系统提示词字段
          const systemPromptField = formConfig.fields.find((f: FormField) => f.id === 'systemPrompt');
          if (systemPromptField) {
            systemPromptField.placeholder = '输入系统提示词，指导AI行为';
          }
          
          // 设置最大输出令牌数
          const maxTokensField = formConfig.fields.find((f: FormField) => f.id === 'maxTokens');
          if (maxTokensField) {
            maxTokensField.min = 100;
            maxTokensField.max = 4000;
            maxTokensField.defaultValue = 1000;
          }
        }
        
        // 初始化表单数据
        const formData: Record<string, any> = {};
        formConfig.fields.forEach((field: FormField) => {
          // 优先使用节点现有数据，没有则使用默认值
          formData[field.id] = nodeData[field.id] !== undefined ? 
            nodeData[field.id] : 
            field.defaultValue;
        });
        
        state.isDrawerOpen = true;
        state.selectedNodeId = nodeId;
        state.selectedNodeData = nodeData;
        state.formConfig = formConfig;
        state.formData = formData;
      });
    },
    
    closeDrawer: () => {
      set(state => {
        state.isDrawerOpen = false;
        state.selectedNodeId = null;
        state.selectedNodeData = null;
        state.formConfig = null;
        state.formData = {};
      });
    },
    
    updateFormData: (fieldId, value) => {
      set(state => {
        state.formData[fieldId] = value;
      });
    },
    
    getFormConfigForNodeType: (nodeType) => {
      return nodeFormConfigs[nodeType] || nodeFormConfigs.default;
    },
    
    applyChanges: () => {
      const { selectedNodeId, formData } = get();
      
      if (!selectedNodeId) return;
      
      // 使用flow-store更新节点数据
      // 这里我们需要导入flow-store中的updateNodeData函数
      const { updateNodeData } = require('./flow-store').useFlowStore.getState();
      updateNodeData(selectedNodeId, formData);
      
      // 关闭抽屉
      get().closeDrawer();
    },
  }))
); 