from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
import json
import asyncio
import time
from typing import List, Dict, Any

from app.services.openai_service import OpenAIService
from app.models.chat import ChatRequest, ChatResponse, ErrorResponse

router = APIRouter()

async def get_openai_service():
    return OpenAIService()

@router.post("/completions", response_model=ChatResponse)
async def chat_completion(
    request: ChatRequest,
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """
    发送聊天请求到OpenAI
    
    接收聊天消息并返回AI回复
    """
    try:
        # 如果请求流式响应
        if request.stream:
            return StreamingResponse(
                stream_openai_response(request, openai_service),
                media_type="text/event-stream"
            )
        
        # 否则返回正常响应
        response = await openai_service.chat_completion(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def stream_openai_response(request: ChatRequest, openai_service: OpenAIService):
    """
    流式处理OpenAI响应
    """
    try:
        stream = await openai_service.chat_completion(request)
        
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
            await asyncio.sleep(0.01)  # 轻微延迟避免过快发送
            
        yield f"data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n" 