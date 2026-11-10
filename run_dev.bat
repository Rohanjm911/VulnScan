@echo off
echo ========================================================
echo    VULNSCAN - Automated Web Security Intelligence
echo ========================================================
echo Starting VulnScan Backend and Frontend services...
echo.

start "VulnScan Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak >nul

start "VulnScan Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo VulnScan services launched:
echo  - Backend API: http://127.0.0.1:8000 (Docs: /api/docs)
echo  - Frontend UI: http://localhost:3000
echo ========================================================
pause

