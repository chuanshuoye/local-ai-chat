import json
import time
from typing import Dict, List, Any, Optional

import openai
from openai import OpenAI

from app.core.config import settings
from app.models.chat import Message, ChatRequest

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_API_BASE
        )

    async def chat_completion(self, request: ChatRequest) -> Dict[str, Any]:
        """
        调用OpenAI API完成聊天请求
        
        Args:
            request: 聊天请求参数
            
        Returns:
            API响应
        """
        try:
            # 设置默认模型
            model = request.model or settings.DEFAULT_MODEL
            
            # 准备消息
            messages = []
            for msg in request.messages:
                messages.append({"role": msg.role, "content": msg.content})
            
            # 调用API
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=request.temperature,
                top_p=request.top_p,
                max_tokens=request.max_tokens,
                stream=request.stream
            )
            
            # 如果是流式响应，返回流对象
            if request.stream:
                return response
            
            # 转换为字典
            return response.dict()
            
        except Exception as e:
            raise e 