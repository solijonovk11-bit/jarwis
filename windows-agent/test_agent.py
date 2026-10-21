import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from agent.main import app, AUTH_TOKEN

def run_agent_tests():
    print("--- [WINDOWS AGENT TESTS] Boshlanmoqda ---")
    client = TestClient(app)

    # 1. Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "online"
    print("[OK] Agent health check muvaffaqiyatli:", res_health.json())

    # 2. Token info
    res_token = client.get("/token-info")
    assert res_token.status_code == 200
    token = res_token.json()["token"]
    assert token == AUTH_TOKEN
    print("[OK] Agent xavfsizlik tokeni tasdiqlandi")

    # 3. System info
    res_info = client.get("/system-info")
    assert res_info.status_code == 200
    info_data = res_info.json()
    assert "cpu_percent" in info_data
    assert "memory_percent" in info_data
    assert "os" in info_data
    print(f"[OK] Agent tizim telemetriyasi: OS={info_data['os']}, CPU={info_data['cpu_percent']}%, RAM={info_data['memory_percent']}%")

    # 4. Unauthorized request without token
    res_unauth = client.post("/actions/launch", json={"action": "notepad"})
    assert res_unauth.status_code == 401
    print("[OK] Ruxsatsiz so'rov bloklandi (401 Unauthorized)")

    # 5. Invalid action requested
    res_invalid = client.post(
        "/actions/launch",
        json={"action": "rmdir_test"},
        headers={"X-Jarvis-Token": token}
    )
    assert res_invalid.status_code == 400
    print("[OK] Ruxsat berilmagan buyruq xavfsiz bloklandi (400 Bad Request)")

    print("--- [WINDOWS AGENT TESTS] BARCHA TESTLAR MUVAFFAQITYATLI O'TDI! ---")

if __name__ == "__main__":
    run_agent_tests()
