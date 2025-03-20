import os
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Literal

# 加载.env文件
load_dotenv()

class Settings(BaseModel):
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")
    
    # OpenAI配置
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
    
    # Ollama配置
    OLLAMA_API_BASE: str = os.getenv("OLLAMA_API_BASE", "http://localhost:11434")
    
    # 默认设置
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo")
    DEFAULT_PROVIDER: Literal["openai", "ollama"] = os.getenv("DEFAULT_PROVIDER", "openai")
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }

# 创建全局设置对象
settings = Settings() 