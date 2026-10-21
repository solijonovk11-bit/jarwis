import asyncio
import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_backend_tests():
    print("--- [BACKEND TESTS] Boshlanmoqda ---")
    with TestClient(app) as client:
        # 1. Health check
        res_health = client.get("/api/system/health")
        assert res_health.status_code == 200, f"Health check failed: {res_health.text}"
        print("[OK] Health check muvaffaqiyatli:", res_health.json())

        # 2. System status
        res_status = client.get("/api/system/status")
        assert res_status.status_code == 200, f"Status failed: {res_status.text}"
        status_data = res_status.json()
        assert status_data["status"] == "online"
        print("[OK] System status muvaffaqiyatli:", status_data)

        # 3. Chat endpoint
        chat_payload = {"message": "Salom JARVIS, bugun qanday yangiliklar bor?", "session_id": "test-session"}
        res_chat = client.post("/api/chat", json=chat_payload)
        assert res_chat.status_code == 200, f"Chat failed: {res_chat.text}"
        chat_data = res_chat.json()
        assert "reply" in chat_data
        assert len(chat_data["reply"]) > 0
        print("[OK] Chat javobi muvaffaqiyatli:", chat_data["reply"][:80], "...")

        # 4. History check
        res_hist = client.get("/api/chat/history?session_id=test-session")
        assert res_hist.status_code == 200
        hist_data = res_hist.json()
        assert len(hist_data["messages"]) >= 2
        print(f"[OK] Chat tarixi saqlanganligi tasdiqlandi ({len(hist_data['messages'])} ta xabar)")

        # 5. Clear history
        res_clear = client.delete("/api/chat/history?session_id=test-session")
        assert res_clear.status_code == 200
        res_hist_after = client.get("/api/chat/history?session_id=test-session")
        assert len(res_hist_after.json()["messages"]) == 0
        print("[OK] Tarixni tozalash muvaffaqiyatli yakunlandi")

        print("--- [BACKEND TESTS] BARCHA TESTLAR MUVAFFAQITYATLI O'TDI! ---")

if __name__ == "__main__":
    run_backend_tests()
