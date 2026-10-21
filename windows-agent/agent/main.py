import os
import secrets
from typing import Dict, Any, Optional
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .actions import execute_allowlisted_action, get_system_metrics

TOKEN_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "jarvis_token.txt"))

def get_or_create_token() -> str:
    """Xavfsiz avtorizatsiya tokenini olish yoki yangisini yaratish."""
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r", encoding="utf-8") as f:
                token = f.read().strip()
                if token:
                    return token
        except Exception:
            pass

    token = secrets.token_hex(16)
    try:
        with open(TOKEN_FILE, "w", encoding="utf-8") as f:
            f.write(token)
    except Exception as e:
        print(f"[OGOHLANTIRISH] Token faylini yozib bo'lmadi: {e}")
    return token

AUTH_TOKEN = get_or_create_token()

app = FastAPI(
    title="JARVIS Windows Local Agent",
    version="1.0.0",
    description="Mahalliy Windows operatsion tizimi bilan xavfsiz muloqot agenti (faqat 127.0.0.1)"
)

# CORS sozlamalari — faqat frontend uchun
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

def verify_token(x_jarvis_token: Optional[str] = Header(None, alias="X-Jarvis-Token")):
    """So'rov yuboruvchi frontend tokenini tekshirish."""
    # Agar frontend token yubormasa yoki noto'g'ri bo'lsa
    if not x_jarvis_token or x_jarvis_token != AUTH_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Autentifikatsiya xatosi: Noto'g'ri yoki yo'qolgan X-Jarvis-Token."
        )
    return True

class LaunchActionRequest(BaseModel):
    action: str = Field(..., description="Amal nomi: notepad, calc, browser_url")
    payload: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Qo'shimcha parametrlar (masalan url)")

@app.get("/health")
def health():
    return {
        "status": "online",
        "agent": "JARVIS-Windows-Agent",
        "version": "1.0.0",
        "host": "127.0.0.1",
        "token_configured": bool(AUTH_TOKEN)
    }

@app.get("/token-info")
def get_token_info():
    """Lokal brauzer frontend dasturiga tokenni xavfsiz taqdim etish (faqat localhost)."""
    return {
        "token": AUTH_TOKEN,
        "message": "Token faqat lokal 127.0.0.1 portida uzatiladi."
    }

@app.get("/system-info")
def system_info():
    """Tizim ko'rsatkichlarini olish."""
    return get_system_metrics()

@app.post("/actions/launch")
def launch_action(req: LaunchActionRequest, authorized: bool = Depends(verify_token)):
    """Faqat tasdiqlangan va ro'yxatda bor amallarni bajarish."""
    res = execute_allowlisted_action(req.action, req.payload)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Amal bajarilmadi."))
    return res

if __name__ == "__main__":
    import uvicorn
    print(f"[JARVIS AGENT] Ishga tushmoqda: 127.0.0.1:8001")
    print(f"[JARVIS AGENT] Token: {AUTH_TOKEN}")
    uvicorn.run(app, host="127.0.0.1", port=8001)
