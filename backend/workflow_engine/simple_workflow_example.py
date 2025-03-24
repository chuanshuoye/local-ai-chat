#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
SpiffWorkflow简单示例
不依赖于FastAPI和pydantic
"""

import sys
import json
from SpiffWorkflow.specs import WorkflowSpec, Simple
from SpiffWorkflow.workflow import Workflow
from SpiffWorkflow.task import Task
from SpiffWorkflow.specs.base import TaskSpec

print(f"Python版本: {sys.version}")
print("创建一个简单的工作流示例...")

# 创建工作流规范
spec = WorkflowSpec()

# 添加任务节点
simple_task1 = Simple(spec, "task1")
simple_task1.description = "第一个任务"
simple_task1.data = {"message": "这是任务1的数据"}

simple_task2 = Simple(spec, "task2")
simple_task2.description = "第二个任务"
simple_task2.data = {"message": "这是任务2的数据"}

# 添加结束节点 - 在新版本中需要手动创建
end_task = Simple(spec, "end")
end_task.description = "结束节点"

# 建立连接关系
spec.start.connect(simple_task1)
simple_task1.connect(simple_task2)
simple_task2.connect(end_task)

# 创建工作流实例
workflow = Workflow(spec)

# 执行任务
print("执行工作流...")
workflow.complete_all()

# 打印结果
print(f"工作流是否完成: {workflow.is_completed()}")
print(f"工作流成功: {workflow.success}")
print("\n任务执行顺序:")

for task in workflow.get_tasks():
    if task.get_state() == Task.COMPLETED:
        task_type = task.task_spec.__class__.__name__
        task_id = task.id
        task_name = task.task_spec.name
        print(f"任务ID: {task_id}, 名称: {task_name}, 类型: {task_type}")


# 示例：模拟从React Flow导出的工作流JSON
react_flow_data = {
    "nodes": [
        {
            "id": "start",
            "type": "start",
            "data": {"label": "开始节点"},
            "position": {"x": 100, "y": 100}
        },
        {
            "id": "process",
            "type": "llm",
            "data": {"label": "LLM处理", "prompt": "测试提示词"},
            "position": {"x": 300, "y": 100}
        },
        {
            "id": "end",
            "type": "end",
            "data": {"label": "结束节点"},
            "position": {"x": 500, "y": 100}
        }
    ],
    "edges": [
        {
            "id": "e1",
            "source": "start",
            "target": "process"
        },
        {
            "id": "e2",
            "source": "process",
            "target": "end"
        }
    ]
}

print("\n\n从React Flow数据构建工作流:")
print(json.dumps(react_flow_data, indent=2, ensure_ascii=False))

# 创建工作流规范
spec2 = WorkflowSpec()

# 创建任务节点
node_specs = {}

# 添加开始节点
node_specs["start"] = spec2.start

# 添加其他节点
for node in react_flow_data["nodes"]:
    node_id = node["id"]
    if node_id == "start":
        continue
    
    # 创建任务节点
    # 所有节点（包括结束节点）都创建为Simple类型
    node_specs[node_id] = Simple(spec2, node_id)
    node_specs[node_id].data = node["data"]

# 连接节点
for edge in react_flow_data["edges"]:
    source_id = edge["source"]
    target_id = edge["target"]
    
    source_node = node_specs[source_id]
    target_node = node_specs[target_id]
    
    source_node.connect(target_node)

# 创建并执行工作流
workflow2 = Workflow(spec2)
workflow2.complete_all()

print("\n流程执行结果:")
print(f"工作流是否完成: {workflow2.is_completed()}")
print(f"工作流成功: {workflow2.success}")

print("\n执行的任务:")
for task in workflow2.get_tasks():
    if task.get_state() == Task.COMPLETED:
        print(f"任务: {task.task_spec.name}, 数据: {task.data if hasattr(task, 'data') else 'None'}")

print("\n示例运行完成!")