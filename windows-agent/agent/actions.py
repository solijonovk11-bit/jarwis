import subprocess
import webbrowser
import urllib.parse
import platform
import psutil
from typing import Dict, Any

ALLOWED_ACTIONS = ["notepad", "calc", "browser_url"]

def get_system_metrics() -> Dict[str, Any]:
    """Tizim resurslari va ko'rsatkichlarini olish."""
    cpu_usage = psutil.cpu_percent(interval=0.2)
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
    """Faqatgina ruxsat etilgan xavfsiz Windows buyruqlarini bajarish."""
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
