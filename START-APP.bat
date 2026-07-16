@echo off
title Aegis Medical App - Starting...
color 0A

echo.
echo  ============================================
echo   AEGIS MEDICAL DIAGNOSTIC ASSISTANT
echo   Starting all services... Please wait...
echo  ============================================
echo.

:: Step 1: Setup backend venv if not exists
cd /d "%~dp0backend"
if not exist "venv\Scripts\python.exe" (
    echo [1/4] Creating Python virtual environment...
    python -m venv venv
    echo [2/4] Installing backend packages (this takes ~1 min first time)...
    venv\Scripts\pip install -r requirements.txt --quiet
) else (
    echo [1/4] Python environment already ready!
    echo [2/4] Skipping install...
)

:: Step 2: Setup frontend node_modules if not exists
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [3/4] Installing frontend packages...
    npm install --silent
) else (
    echo [3/4] Node modules already ready!
)

:: Step 3: Start backend in new window
echo [4/4] Launching servers...
cd /d "%~dp0backend"
start "Aegis Backend :8000" cmd /k "venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

:: Step 4: Start frontend in new window
cd /d "%~dp0frontend"
start "Aegis Frontend :3000" cmd /k "npm run dev"

:: Wait 4 seconds for frontend to start
timeout /t 4 /nobreak > nul

:: Step 5: Open browser automatically
echo.
echo  ============================================
echo   App is ready! Opening browser...
echo   URL: http://localhost:3000
echo  ============================================
echo.
start "" "http://localhost:3000"

echo  Both servers are running in separate windows.
echo  DO NOT close those windows while using the app.
echo.
pause
