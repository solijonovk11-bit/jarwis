@echo off
title JARVIS Windows Agent (127.0.0.1:8001)
echo ========================================================
echo         JARVIS WINDOWS LOCAL DESKTOP AGENT
echo ========================================================
echo.
cd /d "%~dp0"
python -m uvicorn agent.main:app --host 127.0.0.1 --port 8001
pause
