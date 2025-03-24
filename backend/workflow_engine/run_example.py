#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
运行工作流引擎示例
"""

import sys
import os

# 将当前目录添加到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入示例模块
from example import main

if __name__ == "__main__":
    # 运行示例
    main() 