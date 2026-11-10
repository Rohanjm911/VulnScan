@echo off
title VulnScan - Stop Services
cd /d "%~dp0"
color 0C
echo.
echo ========================================================
echo    VULNSCAN - Shutting Down Services
echo ========================================================
echo.
echo [*] Terminating processes on Port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [+] Stopped process with PID %%a
)

echo [*] Terminating processes on Port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [+] Stopped process with PID %%a
)

echo.
echo [OK] All VulnScan services stopped successfully.
echo ========================================================
timeout /t 3 >nul

