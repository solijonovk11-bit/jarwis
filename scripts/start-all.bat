@echo off
title JARVIS AI (Bitta Manzilda: http://localhost:8000)
echo ========================================================
echo       JARVIS AI MARK VII - ALL-IN-ONE (BITTA LINKDA)
echo ========================================================
echo.
cd /d "%~dp0\.."
echo Tizim ishga tushirilmoqda: http://localhost:8000 ...
timeout /t 2 /nobreak >nul
start http://localhost:8000
npm start
pause
