from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatMessage(BaseModel):
    role: str = Field(..., description="Foydalanuvchi yoki yordamchi roli: 'user' yoki 'assistant' yoki 'system'")
    content: str = Field(..., description="Xabar matni")
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Foydalanuvchi savoli yoki buyrug'i")
    session_id: Optional[str] = Field(default="default", description="Sessiya identifikatori")
    language: Optional[str] = Field(default="uz", description="Til: uz, en, ru")

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    provider: str
    model: str
    timestamp: str
    suggested_action: Optional[str] = None
    action_payload: Optional[dict] = None

class ClearHistoryRequest(BaseModel):
    session_id: Optional[str] = "default"

class SystemStatusResponse(BaseModel):
    status: str
    version: str
    provider: str
    model: str
    ai_configured: bool
    db_status: str
    timestamp: str
