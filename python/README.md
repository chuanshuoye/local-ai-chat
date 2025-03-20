# OpenManus API 服务

基于FastAPI搭建的OpenAI API代理服务，提供HTTP接口调用大语言模型。

## 功能特点

- 基于FastAPI构建的高性能API服务
- 支持OpenAI兼容的API调用
- 提供同步和流式响应两种模式
- 简单易用的HTTP接口
- 完善的错误处理机制

## 环境要求

- Python 3.8+
- 有效的OpenAI API密钥

## 安装

1. 克隆此仓库

```bash
git clone <仓库地址>
cd <仓库目录>/python
```

2. 安装依赖

```bash
pip install -r requirements.txt
```

3. 配置环境变量

复制`.env.example`文件为`.env`并修改相关配置，尤其是`OPENAI_API_KEY`。

```bash
cp .env.example .env
```

## 启动服务

```bash
python run.py
```

服务启动后，可以通过 http://localhost:8000/docs 访问API文档。

## API使用

### 健康检查

```bash
curl http://localhost:8000/api/v1/health
```

### 聊天完成接口

```bash
curl -X POST http://localhost:8000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "你是一个有用的AI助手。"},
      {"role": "user", "content": "你好，请介绍一下自己。"}
    ],
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }'
```

### 流式响应接口

```bash
curl -X POST http://localhost:8000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "messages": [
      {"role": "system", "content": "你是一个有用的AI助手。"},
      {"role": "user", "content": "请写一篇关于人工智能的短文。"}
    ],
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "stream": true
  }'
```

## 客户端示例

查看`client_example.py`文件了解如何在Python中调用API。

```bash
python client_example.py
```

## 项目结构

```
.
├── app/                # 主应用目录
│   ├── api/            # API路由
│   │   └── api_v1/     # API v1版本
│   │       └── endpoints/ # API端点
│   ├── core/           # 核心配置
│   ├── models/         # 数据模型
│   └── services/       # 服务层
├── .env                # 环境变量配置
├── requirements.txt    # 依赖列表
├── run.py              # 启动脚本
└── client_example.py   # 客户端示例
``` 