import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"启动API服务于 http://{settings.API_HOST}:{settings.API_PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    ) 