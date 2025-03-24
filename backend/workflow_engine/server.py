#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
工作流引擎API服务器
启动FastAPI服务器
"""

import uvicorn
from .api import app

if __name__ == "__main__":
    # 启动FastAPI服务器
    uvicorn.run(
        "api:app",
        host="0.0.0.0", 
        port=5000,
        log_level="info",
        reload=True
    )
    print("工作流引擎API服务器已启动，访问 http://localhost:5000/docs 查看API文档") 