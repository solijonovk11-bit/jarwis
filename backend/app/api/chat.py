from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..models.chat import ChatRequest, ChatResponse, ClearHistoryRequest
from ..services.ai_service import ai_service
from ..database import save_message, get_history, clear_history

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Foydalanuvchi bilan muloqot qilish endpointi."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Xabar matni bo'sh bo'lishi mumkin emas.")

    session_id = request.session_id or "default"
    
    # 1. Foydalanuvchi xabarini bazaga yozish
    await save_message(session_id=session_id, role="user", content=request.message.strip())
    
    # 2. Sessiya tarixini olish
    history = await get_history(session_id=session_id, limit=12)
    
    # 3. AI javobini olish
    ai_result = await ai_service.generate_response(
        user_message=request.message.strip(),
        history=history
    )
    
    reply_text = ai_result.get("reply", "Kechirasiz janob, tizimda kutilmagan javob qaytdi.")
    
    # 4. Yordamchi javobini bazaga yozish
    await save_message(session_id=session_id, role="assistant", content=reply_text)
    
    return ChatResponse(
        reply=reply_text,
        session_id=session_id,
        provider=ai_result.get("provider", "unknown"),
        model=ai_result.get("model", "unknown"),
        timestamp=datetime.utcnow().isoformat(),
        suggested_action=ai_result.get("suggested_action"),
        action_payload=ai_result.get("action_payload")
    )

@router.get("/history")
async def history_endpoint(session_id: str = "default"):
    """Sessiya tarixini ko'rish."""
    history = await get_history(session_id=session_id, limit=50)
    return {"session_id": session_id, "messages": history}

@router.delete("/history")
async def clear_history_endpoint(session_id: str = "default"):
    """Sessiya tarixini o'chirish."""
    await clear_history(session_id=session_id)
    return {"status": "success", "message": f"Sessiya {session_id} tarixi muvaffaqiyatli tozalandi."}
