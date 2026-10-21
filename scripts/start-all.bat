@echo off
title JARVIS AI Tizimi
echo ========================================================
echo               JARVIS AI MARK VII - ALL SERVICES
echo ========================================================
echo.
echo 1. Windows Agent ishga tushirilmoqda (127.0.0.1:8001)...
start "JARVIS Windows Agent" cmd /c "%~dp0\..\windows-agent\start-agent.bat"

echo 2. AI Backend ishga tushirilmoqda (127.0.0.1:8000)...
start "JARVIS Backend" cmd /c "%~dp0start-backend.bat"

timeout /t 3 /nobreak >nul

echo 3. Frontend ishga tushirilmoqda (http://localhost:5173)...
start "JARVIS Frontend" cmd /c "%~dp0start-frontend.bat"

echo.
echo Barcha modullar ishga tushirildi! Brauzerda http://localhost:5173 ochilmoqda...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
pause
