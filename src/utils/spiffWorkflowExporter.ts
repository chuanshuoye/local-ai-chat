import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Workflow } from '@/store/workflow-store';

// SpiffWorkflow 相关的类型定义
export interface SpiffTask {
  id: string;
  name: string;
  task_type: string;
  position: {
    x: number;
    y: number;
  };
  properties: Record<string, any>;
}

export interface SpiffTransition {
  id: string;
  from_task_id: string;
  to_task_id: string;
  name: string;
}

export interface SpiffWorkflowProcess {
  id: string;
  name: string;
  description: string;
  tasks: Record<string, SpiffTask>;
  transitions: SpiffTransition[];
}

/**
 * 将React Flow工作流转换为SpiffWorkflow BPMN格式
 * @param workflow React Flow工作流数据
 * @returns SpiffWorkflow格式的流程定义
 */
export const convertToSpiffWorkflow = (workflow: Workflow): SpiffWorkflowProcess => {
  // 创建基础BPMN结构
  const bpmnProcess: SpiffWorkflowProcess = {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description || '',
    tasks: {},
    transitions: [],
  };

  // 映射节点类型到SpiffWorkflow任务类型
  const nodeTypeMap: Record<string, string> = {
    'input': 'StartTask',
    'output': 'EndTask',
    'default': 'Task',
    'agent': 'ScriptTask',
    'custom': 'ManualTask',
  };

  // 处理节点
  workflow.nodes.forEach(node => {
    const nodeType = node.data?.type || 'default';
    const taskType = nodeTypeMap[nodeType] || 'Task';
    
    // 节点配置
    const nodeConfig = workflow.nodeConfigs[node.id] || {};
    
    // 任务属性
    const task: SpiffTask = {
      id: node.id,
      name: node.data?.label || `Task ${node.id}`,
      task_type: taskType,
      position: {
        x: node.position.x,
        y: node.position.y
      },
      properties: {
        ...nodeConfig,
        description: node.data?.description || '',
        icon: node.data?.icon || ''
      }
    };
    
    // 添加到任务集合
    bpmnProcess.tasks[node.id] = task;
  });

  // 处理连线
  workflow.edges.forEach(edge => {
    const transition: SpiffTransition = {
      id: edge.id,
      from_task_id: edge.source,
      to_task_id: edge.target,
      name: typeof edge.label === 'string' ? edge.label : `${edge.source} to ${edge.target}`
    };
    
    // 添加到转换集合
    bpmnProcess.transitions.push(transition);
  });

  return bpmnProcess;
};

/**
 * 创建Python执行脚本
 * @param workflow 工作流数据
 * @param processFileName 流程定义文件名
 * @returns Python脚本内容
 */
export const createPythonScript = (workflow: Workflow, processFileName: string): string => {
  return `#!/usr/bin/env python3
# SpiffWorkflow executor script for ${workflow.name}
  
import json
import os
from spiffworkflow.bpmn.workflow import BpmnWorkflow
from spiffworkflow.bpmn.parser.BpmnParser import BpmnParser
from spiffworkflow.bpmn.specs.BpmnProcessSpec import BpmnProcessSpec

def load_process():
    """加载工作流程定义"""
    with open('${processFileName}', 'r', encoding='utf-8') as f:
        return json.load(f)

def convert_to_bpmn(process_data):
    """将JSON格式的工作流转换为BPMN规范对象"""
    parser = BpmnParser()
    process_spec = BpmnProcessSpec(process_data['id'], process_data['name'], description=process_data['description'])
    
    # 添加任务
    for task_id, task_data in process_data['tasks'].items():
        task_spec = parser.create_task_spec(process_spec, task_data['task_type'], task_id, task_data['name'])
        for key, value in task_data['properties'].items():
            task_spec.data[key] = value
    
    # 添加转换连接
    for transition in process_data['transitions']:
        source_task = process_spec.get_task_spec(transition['from_task_id'])
        target_task = process_spec.get_task_spec(transition['to_task_id'])
        source_task.connect(target_task)
    
    return process_spec

def main():
    """主函数"""
    print(f"执行工作流: ${workflow.name}")
    
    # 加载工作流定义
    process_data = load_process()
    
    # 转换为BPMN规范
    process_spec = convert_to_bpmn(process_data)
    
    # 创建并启动工作流
    workflow = BpmnWorkflow(process_spec)
    workflow.complete_all()
    
    print("工作流执行完成!")
    
    # 输出结果
    tasks_completed = len([t for t in workflow.get_tasks() if t.state == task.COMPLETED])
    print(f"已完成任务: {tasks_completed}/{len(workflow.get_tasks())}")

if __name__ == "__main__":
    main()
`;
};

/**
 * 创建README文件内容
 * @param workflow 工作流数据
 * @param processFileName 流程定义文件名
 * @param spiffWorkflow 转换后的SpiffWorkflow数据
 * @returns README文件内容
 */
export const createReadme = (
  workflow: Workflow, 
  processFileName: string, 
  spiffWorkflow: SpiffWorkflowProcess
): string => {
  return `# ${workflow.name} SpiffWorkflow 导出
      
此工作流是从本地AI聊天应用导出的，兼容SpiffWorkflow引擎。

## 文件说明
- config.json: 工作流配置
- ${processFileName}: 工作流主定义文件
- run_workflow.py: Python执行脚本

## 使用方法
1. 安装SpiffWorkflow库: \`pip install SpiffWorkflow\`
2. 将ZIP包解压到独立目录
3. 执行Python脚本: \`python run_workflow.py\`

## 工作流信息
- 节点数量: ${workflow.nodes.length}
- 连线数量: ${workflow.edges.length}
- 创建时间: ${new Date(workflow.createdAt).toLocaleString()}
- 更新时间: ${new Date(workflow.updatedAt).toLocaleString()}

## 节点列表
${Object.entries(spiffWorkflow.tasks).map(([id, task]) => 
  `- ${task.name} (${task.task_type})`
).join('\n')}
`;
};

/**
 * 导出工作流为SpiffWorkflow兼容的ZIP包
 * @param workflow 要导出的工作流数据
 * @returns 成功返回true，失败返回false
 */
export const exportToSpiffWorkflow = async (workflow: Workflow): Promise<boolean> => {
  try {
    // 转换为SpiffWorkflow格式
    const spiffWorkflow = convertToSpiffWorkflow(workflow);
    
    // 创建ZIP文件
    const zip = new JSZip();
    
    // 添加工作流定义文件
    const processFileName = `${workflow.name.replace(/\s+/g, '_')}_process.json`;
    zip.file(processFileName, JSON.stringify(spiffWorkflow, null, 2));
    
    // 添加配置文件
    const config = {
      name: workflow.name,
      description: workflow.description || '',
      version: '1.0.0',
      created_at: new Date(workflow.createdAt).toISOString(),
      updated_at: new Date(workflow.updatedAt).toISOString(),
      process_definition: processFileName
    };
    zip.file('config.json', JSON.stringify(config, null, 2));
    
    // 添加Python运行脚本
    const pythonScript = createPythonScript(workflow, processFileName);
    zip.file('run_workflow.py', pythonScript);
    
    // 添加README文件
    const readme = createReadme(workflow, processFileName, spiffWorkflow);
    zip.file('README.md', readme);
    
    // 生成并下载ZIP文件
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${workflow.name.replace(/\s+/g, '_')}_spiffworkflow.zip`);
    
    return true;
  } catch (error) {
    console.error('导出工作流失败:', error);
    return false;
  }
}; 