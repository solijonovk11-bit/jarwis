import os
import secrets
import platform
import subprocess
import webbrowser
import urllib.parse
import psutil
from typing import Dict, Any, Optional
from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/agent", tags=["agent"])

TOKEN_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "windows-agent", "jarvis_token.txt"))

def get_or_create_token() -> str:
    """Xavfsiz avtorizatsiya tokenini olish yoki yaratish."""
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
        os.makedirs(os.path.dirname(TOKEN_FILE), exist_ok=True)
        with open(TOKEN_FILE, "w", encoding="utf-8") as f:
            f.write(token)
    except Exception as e:
        print(f"[OGOHLANTIRISH] Token yozib bo'lmadi: {e}")
    return token

AUTH_TOKEN = get_or_create_token()
ALLOWED_ACTIONS = ["notepad", "calc", "browser_url"]

def get_system_metrics() -> Dict[str, Any]:
    """Tizim telemetriyasini olish."""
    cpu_usage = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("C:\\" if platform.system() == "Windows" else "/")
    
    battery_info = None
    try:
        battery = psutil.sensors_battery()
        if battery:
            battery_info = {
                "percent": battery.percent,
                "power_plugged": battery.power_plugged
            }
    except Exception:
        pass

    return {
        "os": f"{platform.system()} {platform.release()} ({platform.version()})",
        "cpu_percent": cpu_usage,
        "memory_total_gb": round(memory.total / (1024 ** 3), 2),
        "memory_used_gb": round(memory.used / (1024 ** 3), 2),
        "memory_percent": memory.percent,
        "disk_total_gb": round(disk.total / (1024 ** 3), 2),
        "disk_free_gb": round(disk.free / (1024 ** 3), 2),
        "disk_percent": disk.percent,
        "battery": battery_info
    }

def execute_allowlisted_action(action_id: str, payload: Dict[str, Any] = None) -> Dict[str, Any]:
    """Ruxsat etilgan xavfsiz Windows buyruqlarini bajarish."""
    if action_id not in ALLOWED_ACTIONS:
        return {
            "success": False,
            "error": f"Ruxsat etilmagan amal: '{action_id}'. Faqat notepad, calc yoki browser_url ruxsat etilgan."
        }

    try:
        if action_id == "notepad":
            subprocess.Popen(["notepad.exe"])
            return {
                "success": True,
                "action": "notepad",
                "message": "Windows Bloknot (Notepad) dasturi muvaffaqiyatli ishga tushirildi."
            }

        elif action_id == "calc":
            subprocess.Popen(["calc.exe"])
            return {
                "success": True,
                "action": "calc",
                "message": "Windows Kalkulyator dasturi muvaffaqiyatli ishga tushirildi."
            }

        elif action_id == "browser_url":
            url = (payload or {}).get("url", "").strip()
            if not url:
                return {"success": False, "error": "Veb-manzil (URL) kiritilmadi."}

            parsed = urllib.parse.urlparse(url)
            if parsed.scheme not in ["http", "https"]:
                return {
                    "success": False,
                    "error": "Xavfsizlik talabi: Faqat http:// yoki https:// protokolidagi manzillarni ochish mumkin."
                }

            webbrowser.open(url)
            return {
                "success": True,
                "action": "browser_url",
                "url": url,
                "message": f"Brauzerda sahifa ochildi: {url}"
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Ilovani ishga tushirishda xatolik: {str(e)}"
        }

    return {"success": False, "error": "Noma'lum xatolik yuz berdi."}

class LaunchActionRequest(BaseModel):
    action: str = Field(..., description="Amal nomi: notepad, calc, browser_url")
    payload: Optional[Dict[str, Any]] = Field(default_factory=dict)

def verify_token(x_jarvis_token: Optional[str] = Header(None, alias="X-Jarvis-Token")):
    # Lokal 127.0.0.1 da ishlayotganda token ixtiyoriy lekin to'g'ri bo'lishi tekshiriladi
    if x_jarvis_token and x_jarvis_token != AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="Noto'g'ri X-Jarvis-Token.")
    return True

@router.get("/health")
def agent_health():
    return {
        "status": "online",
        "agent": "JARVIS-Unified-Agent",
        "version": "2.0.0",
        "token_configured": bool(AUTH_TOKEN)
    }

@router.get("/token-info")
def get_token_info():
    return {"token": AUTH_TOKEN}

@router.get("/system-info")
def system_info():
    return get_system_metrics()

@router.post("/actions/launch")
def launch_action(req: LaunchActionRequest, authorized: bool = Depends(verify_token)):
    res = execute_allowlisted_action(req.action, req.payload)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Amal bajarilmadi."))
    return res
