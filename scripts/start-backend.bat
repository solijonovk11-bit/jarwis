@echo off
title JARVIS AI Backend (127.0.0.1:8000)
echo ========================================================
echo               JARVIS AI FASTAPI BACKEND
echo ========================================================
echo.
cd /d "%~dp0\..\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
