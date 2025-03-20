import requests
import json
import sseclient
import time

API_BASE = "http://localhost:8000/api/v1"

def regular_chat():
    """常规聊天请求示例"""
    url = f"{API_BASE}/chat/completions"
    
    payload = {
        "messages": [
            {"role": "system", "content": "你是一个有用的AI助手。"},
            {"role": "user", "content": "你好，请介绍一下自己。"}
        ],
        "model": "gpt-3.5-turbo",
        "temperature": 0.7
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print("发送聊天请求...")
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print("\nAPI响应:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        print("\nAI回复:")
        print(result["choices"][0]["message"]["content"])
    else:
        print(f"请求失败: {response.status_code}")
        print(response.text)

def streaming_chat():
    """流式响应聊天请求示例"""
    url = f"{API_BASE}/chat/completions"
    
    payload = {
        "messages": [
            {"role": "system", "content": "你是一个有用的AI助手。"},
            {"role": "user", "content": "请写一篇关于人工智能发展的短文。"}
        ],
        "model": "gpt-3.5-turbo",
        "temperature": 0.7,
        "stream": True
    }
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
    }
    
    print("发送流式聊天请求...")
    response = requests.post(url, json=payload, headers=headers, stream=True)
    
    if response.status_code == 200:
        client = sseclient.SSEClient(response)
        print("\nAI回复:")
        full_response = ""
        for event in client.events():
            if event.data == "[DONE]":
                break
            try:
                data = json.loads(event.data)
                content = data.get("content", "")
                print(content, end="", flush=True)
                full_response += content
            except json.JSONDecodeError:
                print(f"无法解析: {event.data}")
        print("\n\n完整响应:")
        print(full_response)
    else:
        print(f"请求失败: {response.status_code}")
        print(response.text)

def health_check():
    """健康检查示例"""
    url = f"{API_BASE}/health"
    
    print("检查API健康状态...")
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        print("服务状态:")
        print(json.dumps(result, indent=2))
    else:
        print(f"请求失败: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    try:
        # 首先检查服务健康状态
        health_check()
        
        print("\n" + "-"*50 + "\n")
        
        # 常规聊天请求
        regular_chat()
        
        print("\n" + "-"*50 + "\n")
        
        # 流式响应请求
        streaming_chat()
        
    except requests.exceptions.ConnectionError:
        print("无法连接到API服务，请确保服务已启动。")
    except Exception as e:
        print(f"发生错误: {str(e)}") 