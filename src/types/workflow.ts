import { Node, Edge } from 'reactflow';

export interface WorkflowData {
  nodes: Node[];
  edges: Edge[];
  id?: string;
  name?: string;
  description?: string;
}

export interface WorkflowCreateRequest {
  name: string;
  description?: string;
  workflow_data: WorkflowData;
}

export interface WorkflowResponse {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowExecuteRequest {
  workflow_id: string;
  input_data: Record<string, any>;
}

export interface WorkflowExecuteResponse {
  execution_id: string;
  workflow_id: string;
  status: 'completed' | 'failed';
  result: Record<string, any>;
  error?: string;
}

export interface ExecutorConfigModel {
  type: string;
  config: Record<string, any>;
}

export interface ExecutorListResponse {
  executors: Record<string, string>;
}

export interface LlmNodeData {
  label: string;
  model?: string;
  prompt?: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface NodeTypeData {
  type: string;
  label: string;
  description?: string;
  inputHandles?: string[];
  outputHandles?: string[];
  defaultData?: Record<string, any>;
  category?: 'input' | 'process' | 'output' | 'llm' | 'condition';
} 