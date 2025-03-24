#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
工作流引擎模块
基于SpiffWorkflow实现的轻量级AI工作流引擎
支持从React Flow导出的工作流配置转换成可执行的工作流
"""

import json
import uuid
from typing import Dict, Any, List, Optional

# 尝试标准导入方式
from SpiffWorkflow.specs import WorkflowSpec, Simple
from SpiffWorkflow.workflow import Workflow
from SpiffWorkflow.task import Task



class WorkflowEngine:
    """工作流引擎类"""
    
    def __init__(self):
        """初始化工作流引擎"""
        self.workflows = {}
    
    def create_workflow_from_reactflow(self, flow_data: Dict[str, Any], workflow_id: str) -> str:
        """
        从React Flow导出的数据创建工作流
        
        Args:
            flow_data: React Flow导出的工作流数据
            workflow_id: 工作流唯一标识
            
        Returns:
            workflow_id: 工作流ID
        """
        # 创建工作流规范
        spec = WorkflowSpec()
        
        # 创建任务节点映射
        node_specs = {}
        
        # 添加开始节点
        node_specs["start"] = spec.start
        
        # 添加其他节点
        for node in flow_data.get("nodes", []):
            node_id = node["id"]
            if node_id == "start":
                continue
            
            # 创建任务节点
            node_specs[node_id] = Simple(spec, node_id)
            node_specs[node_id].data = node.get("data", {})
        
        # 连接节点
        for edge in flow_data.get("edges", []):
            source_id = edge["source"]
            target_id = edge["target"]
            
            source_node = node_specs.get(source_id)
            target_node = node_specs.get(target_id)
            
            if source_node and target_node:
                source_node.connect(target_node)
        
        # 创建工作流实例
        workflow = Workflow(spec)
        
        # 存储工作流
        self.workflows[workflow_id] = workflow
        
        return workflow_id
    
    def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """
        执行指定的工作流
        
        Args:
            workflow_id: 工作流ID
            
        Returns:
            执行结果
        """
        workflow = self.workflows.get(workflow_id)
        if not workflow:
            raise ValueError(f"工作流 {workflow_id} 不存在")
        
        # 执行工作流
        workflow.complete_all()
        
        # 获取执行结果
        result = {
            "completed": workflow.is_completed(),
            "success": workflow.success,
            "tasks": []
        }
        
        # 获取已完成的任务
        for task in workflow.get_tasks():
            if task.get_state() == Task.COMPLETED:
                task_info = {
                    "id": task.id,
                    "name": task.task_spec.name,
                    "type": task.task_spec.__class__.__name__,
                    "data": task.task_spec.data if hasattr(task.task_spec, "data") else None
                }
                result["tasks"].append(task_info)
        
        return result
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """
        获取工作流状态
        
        Args:
            workflow_id: 工作流ID
            
        Returns:
            工作流状态信息
        """
        workflow = self.workflows.get(workflow_id)
        if not workflow:
            raise ValueError(f"工作流 {workflow_id} 不存在")
        
        status = {
            "id": workflow_id,
            "completed": workflow.is_completed(),
            "success": workflow.success,
            "active_tasks": len(workflow.get_tasks(state=Task.READY))
        }
        
        return status
    
    def list_workflows(self) -> List[Dict[str, Any]]:
        """
        列出所有工作流
        
        Returns:
            工作流列表
        """
        return [
            {
                "id": wf_id,
                "completed": wf.is_completed(),
                "success": wf.success
            }
            for wf_id, wf in self.workflows.items()
        ] 