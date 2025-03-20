import json
import httpx
from typing import Dict, List, Any, AsyncGenerator, Union

from app.core.config import settings
from app.models.chat import Message, ChatRequest

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_API_BASE
        self.client = httpx.AsyncClient(base_url=self.base_url)

    async def chat_completion(self, request: ChatRequest) -> Union[Dict[str, Any], AsyncGenerator[Dict[str, Any], None]]:
        """
        调用Ollama API完成聊天请求
        
        Args:
            request: 聊天请求参数
            
        Returns:
            API响应或响应流
        """
        try:
            # 准备消息
            # 将消息转换为单个提示字符串
            prompt = "\n".join([f"{msg.role}: {msg.content}" for msg in request.messages])
            
            # 准备请求数据
            data = {
                "model": request.model or settings.DEFAULT_MODEL,
                "prompt": prompt,
                "stream": request.stream,
                "options": {
                    "temperature": request.temperature,
                    "top_p": request.top_p
                }
            }
            
            # 调用API
            if request.stream:
                return self._stream_chat_completion(data)
            else:
                return await self._regular_chat_completion(data)
                
        except Exception as e:
            raise e

    async def _regular_chat_completion(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        发送普通的聊天请求
        """
        try:
            response = await self.client.post("/api/generate", json=data)
            response.raise_for_status()
            result = response.json()
            # 转换为标准格式
            return {
                "message": {
                    "role": "assistant",
                    "content": result.get("response", "")
                }
            }
        finally:
            await self.client.aclose()

    async def _stream_chat_completion(self, data: Dict[str, Any]) -> AsyncGenerator[Dict[str, Any], None]:
        """
        发送流式聊天请求
        """
        try:
            async with self.client.stream("POST", "/api/generate", json=data) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if "response" in chunk:
                                yield {
                                    "message": {
                                        "role": "assistant",
                                        "content": chunk["response"]
                                    }
                                }
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            raise e

    async def list_models(self) -> List[Dict[str, Any]]:
        """
        获取可用模型列表
        """
        try:
            response = await self.client.get("/api/tags")
            response.raise_for_status()
            return response.json().get("models", [])
        except Exception as e:
            raise e
        finally:
            await self.client.aclose() 