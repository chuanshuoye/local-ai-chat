#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
运行工作流引擎API服务器
"""

import sys
import os
from flask import Flask

# 将当前目录添加到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入API模块
from api import create_app

if __name__ == "__main__":
    # 创建并运行Flask应用
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=5050,
        debug=True
    )
    print("工作流引擎API服务器已启动，访问 http://localhost:5050/ 查看API") 