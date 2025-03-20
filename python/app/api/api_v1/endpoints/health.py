from fastapi import APIRouter, Depends
from pydantic import BaseModel
import time

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: float

@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    健康检查接口
    
    返回API的当前状态、版本和时间戳
    """
    return {
        "status": "ok",
        "version": "0.1.0",
        "timestamp": time.time()
    } 