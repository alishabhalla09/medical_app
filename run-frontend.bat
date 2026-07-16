@echo off
title Aegis Frontend Server
echo ==============================
echo  Aegis Diagnostic - FRONTEND
echo  App: http://localhost:3000
echo ==============================

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [*] Installing npm packages...
    npm install
)

echo [*] Starting Vite dev server on port 3000...
npm run dev
pause
