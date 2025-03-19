import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { cloneDeep } from 'lodash';
import { FlowNodeData } from './flow-store';
import { FormField, FormConfig, nodeFormConfigs, getFormConfigForNodeType } from './models/config-model';

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
        const formConfig = cloneDeep(getFormConfigForNodeType(nodeType));
        
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
        
        // 如果是多Agent类型，同样需要填充选项
        if (nodeType === 'multiagent' as string) {
          const { agents } = require('./agent-store').useAgentStore.getState();
          const agentIdsField = formConfig.fields.find((f: FormField) => f.id === 'agentIds');
          if (agentIdsField && agents) {
            agentIdsField.options = agents.map((a: any) => ({
              label: a.name,
              value: a.id
            }));
          }
        }
        
        // 初始化表单数据
        const formData: Record<string, any> = {};
        formConfig.fields.forEach((field: FormField) => {
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
    
    getFormConfigForNodeType,
    
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