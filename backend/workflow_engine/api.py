#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
工作流引擎API模块
"""

from flask import Flask, request, jsonify
from workflow_engine import WorkflowEngine

def create_app():
    app = Flask(__name__)
    workflow_engine = WorkflowEngine()

    @app.route("/workflows", methods=["POST"])
    def create_workflow():
        """创建工作流"""
        data = request.get_json()
        workflow_id = data.get("workflow_id", "test-workflow")
        flow_data = data.get("flow_data", {})
        
        try:
            workflow_id = workflow_engine.create_workflow_from_reactflow(flow_data, workflow_id)
            return jsonify({"workflow_id": workflow_id})
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/workflows/<workflow_id>/execute", methods=["POST"])
    def execute_workflow(workflow_id):
        """执行工作流"""
        try:
            result = workflow_engine.execute_workflow(workflow_id)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/workflows/<workflow_id>/status", methods=["GET"])
    def get_workflow_status(workflow_id):
        """获取工作流状态"""
        try:
            status = workflow_engine.get_workflow_status(workflow_id)
            return jsonify(status)
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @app.route("/workflows", methods=["GET"])
    def list_workflows():
        """列出所有工作流"""
        workflows = workflow_engine.list_workflows()
        return jsonify(workflows)

    return app 