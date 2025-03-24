# 本地AI工作流引擎

基于Python实现的轻量级AI工作流解析和执行引擎，支持从React Flow导出工作流配置转换成可执行的工作流。

## 功能特点

1. 使用SpiffWorkflow作为底层工作流引擎
2. 支持从React Flow导出的工作流配置数据转换成可执行的工作流
3. RESTful API接口，便于与前端集成

## 项目结构

```
workflow_engine/
├── __init__.py             # 包初始化文件
├── workflow_engine.py      # 工作流引擎核心模块
├── api.py                  # RESTful API接口
├── server.py               # API服务器
├── example.py              # 使用示例
├── run_example.py          # 运行示例脚本
├── run_server.py           # 运行API服务器脚本
├── requirements.txt        # 项目依赖项
└── README.md               # 项目说明
```

## 安装

1. 创建并激活虚拟环境（可选）

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/MacOS
source venv/bin/activate
```

2. 安装依赖项

```bash
pip install -r requirements.txt
```

## 使用说明

### 作为Python库使用

```python
from workflow_engine import WorkflowEngine

# 初始化工作流引擎
engine = WorkflowEngine()

# 创建工作流
workflow_id = engine.create_workflow_from_reactflow(flow_data, "my-workflow")

# 执行工作流
result = engine.execute_workflow(workflow_id)

# 获取执行结果
print(result)
```

### 运行示例

```bash
python run_example.py
```

### 启动API服务器

```bash
python run_server.py
```

启动后可访问 http://localhost:5000/docs 查看API文档并进行交互测试。

## API接口

- `POST /workflows` - 创建工作流
- `POST /workflows/{workflow_id}/execute` - 执行工作流
- `GET /workflows/{workflow_id}` - 获取工作流状态
- `GET /workflows` - 列出所有工作流

## 工作流配置格式

工作流配置使用React Flow格式，包含nodes（节点）和edges（连接）两部分：

```json
{
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
```

## 开发计划

1. 支持更多节点类型
2. 添加条件分支和循环支持
3. 集成本地LLM和其他AI组件
4. 优化React Flow与工作流引擎的交互体验

