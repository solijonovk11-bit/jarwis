from fastapi import APIRouter
from datetime import datetime
from ..models.chat import SystemStatusResponse
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/status", response_model=SystemStatusResponse)
async def system_status():
    """Tizim holati va AI sozlamalari ma'lumoti."""
    return SystemStatusResponse(
        status="online",
        version="2.0.0-JARVIS",
        provider=ai_service.provider,
        model=ai_service.model,
        ai_configured=ai_service.is_configured(),
        db_status="connected",
        timestamp=datetime.utcnow().isoformat()
    )

@router.get("/health")
async def health_check():
    """Server salomatligini tekshirish."""
    return {"status": "ok", "service": "JARVIS-Backend", "time": datetime.utcnow().isoformat()}
