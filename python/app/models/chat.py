from typing import List, Optional, Dict, Any, Union, Literal
from pydantic import BaseModel, Field

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = None
    provider: Optional[Literal["openai", "ollama"]] = None
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 1.0
    max_tokens: Optional[int] = None
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    id: str
    model: str
    created: int
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]

class ErrorResponse(BaseModel):
    error: bool = True
    message: str
    code: Optional[int] = None
    details: Optional[Dict[str, Any]] = None 