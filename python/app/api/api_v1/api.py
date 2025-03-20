from fastapi import APIRouter

from app.api.api_v1.endpoints import chat, health

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["健康检查"])
api_router.include_router(chat.router, prefix="/chat", tags=["聊天接口"]) 