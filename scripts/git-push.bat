@echo off
title JARVIS - GitHub Push
echo ========================================================
echo               JARVIS GITHUBGA YUKLASH
echo ========================================================
echo.
cd /d "%~dp0\.."
echo 1. Eski keshdagi login tozalanmoqda...
cmdkey /delete:git:https://github.com >nul 2>&1
echo.
echo 2. GitHub repozitoriyasiga yuklanmoqda...
echo    (Brauzer ochilsa, solijonovk11-bit hisobingiz bilan tasdiqlang)
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo [MUVAFFAQITYAT] Kod muvaffaqiyatli GitHubga yuklandi!
    echo ========================================================
) else (
    echo [XATOLIK] Yuklashda xatolik yuz berdi.
)
echo.
pause
