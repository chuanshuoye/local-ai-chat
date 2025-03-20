from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
import json
import asyncio
import time
from typing import List, Dict, Any, Union

from app.core.config import settings
from app.services.openai_service import OpenAIService
from app.services.ollama_service import OllamaService
from app.models.chat import ChatRequest, ChatResponse, ErrorResponse

router = APIRouter()

async def get_chat_service(request: ChatRequest):
    provider = request.provider or settings.DEFAULT_PROVIDER
    if provider == "openai":
        return OpenAIService()
    elif provider == "ollama":
        return OllamaService()
    else:
        raise HTTPException(status_code=400, detail=f"不支持的提供商: {provider}")

@router.post("/completions", response_model=ChatResponse)
async def chat_completion(
    request: ChatRequest,
    service: Union[OpenAIService, OllamaService] = Depends(get_chat_service)
):
    """
    发送聊天请求到AI提供商
    
    接收聊天消息并返回AI回复
    """
    try:
        # 如果请求流式响应
        if request.stream:
            return StreamingResponse(
                stream_chat_response(request, service),
                media_type="text/event-stream"
            )
        
        # 否则返回正常响应
        response = await service.chat_completion(request)
        
        # 如果是Ollama响应，转换为标准格式
        if isinstance(service, OllamaService):
            return {
                "id": f"ollama-{int(time.time())}",
                "model": request.model or settings.DEFAULT_MODEL,
                "created": int(time.time()),
                "choices": [{
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response["message"]["content"]
                    },
                    "finish_reason": "stop"
                }],
                "usage": {
                    "prompt_tokens": 0,  # Ollama不提供token计数
                    "completion_tokens": 0,
                    "total_tokens": 0
                }
            }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def stream_chat_response(request: ChatRequest, service: Union[OpenAIService, OllamaService]):
    """
    流式处理AI响应
    """
    try:
        stream = await service.chat_completion(request)
        
        if isinstance(service, OpenAIService):
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
                await asyncio.sleep(0.01)  # 轻微延迟避免过快发送
        else:  # OllamaService
            async for chunk in stream:
                if "message" in chunk and "content" in chunk["message"]:
                    yield f"data: {json.dumps({'content': chunk['message']['content']})}\n\n"
                await asyncio.sleep(0.01)
            
        yield f"data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@router.get("/models")
async def list_models():
    """
    获取所有可用的模型列表
    """
    try:
        models = []
        
        # 获取OpenAI模型
        try:
            openai_service = OpenAIService()
            openai_models = await openai_service.list_models()
            models.extend([{"name": m, "provider": "openai"} for m in openai_models])
        except Exception as e:
            print(f"获取OpenAI模型失败: {e}")
        
        # 获取Ollama模型
        try:
            ollama_service = OllamaService()
            ollama_models = await ollama_service.list_models()
            models.extend([{"name": m["name"], "provider": "ollama"} for m in ollama_models])
        except Exception as e:
            print(f"获取Ollama模型失败: {e}")
        
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 