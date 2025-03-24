#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
工作流引擎使用示例
展示如何使用本地AI工作流引擎
"""

import json
import uuid
from workflow_engine import WorkflowEngine

def main():
    """主函数"""
    print("===== 工作流引擎使用示例 =====")
    
    # 初始化工作流引擎
    engine = WorkflowEngine()
    
    # 示例：从React Flow导出的工作流JSON
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
    
    print("\n1. 创建工作流")
    workflow_id = engine.create_workflow_from_reactflow(react_flow_data, "test-workflow")
    print(f"   工作流创建成功，ID: {workflow_id}")
    
    print("\n2. 获取工作流状态")
    status = engine.get_workflow_status(workflow_id)
    print(f"   工作流状态: {json.dumps(status, indent=2, ensure_ascii=False)}")
    
    print("\n3. 执行工作流")
    result = engine.execute_workflow(workflow_id)
    
    # 修改这行代码，使用自定义编码器
    class UUIDEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, uuid.UUID):
                # 将 UUID 转换为字符串
                return str(obj)
            return json.JSONEncoder.default(self, obj)
    
    # 使用自定义编码器
    result_json = json.dumps(result, indent=2, ensure_ascii=False, cls=UUIDEncoder)
    print(f"   执行结果: {result_json}")
    
    print("\n4. 获取所有工作流")
    workflows = engine.list_workflows()
    print(f"   工作流列表: {json.dumps(workflows, indent=2, ensure_ascii=False)}")
    
    print("\n===== 示例结束 =====")

if __name__ == "__main__":
    main() 