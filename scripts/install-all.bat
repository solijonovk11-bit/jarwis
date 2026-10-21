@echo off
title JARVIS O'rnatish Skripti
echo ========================================================
echo         JARVIS AI - BARCHA BOG'LIQLIKLARNI O'RNATISH
echo ========================================================
echo.
echo 1. Python paketlari o'rnatilmoqda (FastAPI, Uvicorn, Pydantic, HTTPX, aiosqlite, psutil)...
python -m pip install -r "%~dp0\..\backend\requirements.txt"
python -m pip install -r "%~dp0\..\windows-agent\requirements.txt"

echo.
echo 2. Frontend Node.js paketlari o'rnatilmoqda...
cd /d "%~dp0\..\frontend"
call npm install

echo.
echo O'rnatish yakunlandi! Tizimni ishga tushirish uchun scripts\start-all.bat ni bosing.
pause
