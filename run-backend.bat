@echo off
title Aegis Backend Server
echo ============================
echo  Aegis Diagnostic - BACKEND
echo  API: http://127.0.0.1:8000
echo ============================

cd /d "%~dp0backend"

if not exist "venv\Scripts\python.exe" (
    echo [*] Creating virtual environment...
    python -m venv venv
    echo [*] Installing packages...
    venv\Scripts\pip install -r requirements.txt
)

echo [*] Starting FastAPI server on port 8000...
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
