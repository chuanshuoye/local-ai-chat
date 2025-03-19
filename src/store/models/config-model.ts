// 表单字段类型
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'color' | 'multiselect';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  defaultValue?: any;
  multiple?: boolean;
}

// 表单配置类型
export interface FormConfig {
  title: string;
  description?: string;
  fields: FormField[];
}

// 节点类型到表单配置的映射
export const nodeFormConfigs: Record<string, FormConfig> = {
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
  multiagent: {
    title: '多Agent对话节点',
    description: '多个AI助手协作处理任务',
    fields: [
      {
        id: 'label',
        type: 'text',
        label: '节点名称',
        placeholder: '输入节点显示名称',
        required: true,
      },
      {
        id: 'agentIds',
        type: 'multiselect',
        label: '选择多个Agent',
        placeholder: '选择多个协作Agent',
        required: true,
        multiple: true,
        options: [], // 运行时动态填充
      },
      {
        id: 'prompt',
        type: 'textarea',
        label: '系统指令',
        placeholder: '输入系统指令，描述多个Agent的协作方式',
      },
      {
        id: 'temperature',
        type: 'number',
        label: '温度',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.7,
        helpText: '数值越高，回复越随机',
      },
      {
        id: 'maxRounds',
        type: 'number',
        label: '最大对话轮次',
        min: 1,
        max: 10,
        defaultValue: 3,
        helpText: 'Agent之间的最大对话轮次',
      },
    ],
  },
};

// 根据节点类型获取表单配置
export function getFormConfigForNodeType(nodeType: string): FormConfig {
  return nodeFormConfigs[nodeType] || nodeFormConfigs.default;
} 