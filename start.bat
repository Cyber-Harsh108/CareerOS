@echo off
title Career Coach - Launcher
color 0A

echo.
echo  =============================================
echo       AI CAREER COACH - Project Launcher
echo  =============================================
echo.

:: ─── Navigate to project root ───────────────────────────────────
cd /d "%~dp0"

:: ─── Step 1: Setup .env ─────────────────────────────────────────
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo  [OK] Created .env from .env.example
    ) else (
        echo  [!!] No .env.example found. Create a .env file manually.
        pause
        exit /b 1
    )
) else (
    echo  [OK] .env already exists
)

:: ─── Step 2: Check Python ───────────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!!] Python is not installed or not on PATH.
    pause
    exit /b 1
)
echo  [OK] Python found

:: ─── Step 3: Check Node.js ──────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!!] Node.js is not installed or not on PATH.
    pause
    exit /b 1
)
echo  [OK] Node.js found

:: ─── Step 4: Install Backend Dependencies ───────────────────────
echo.
echo  [..] Installing backend dependencies...
cd backend
pip install -r requirements.txt --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!!] Backend dependency install failed.
    pause
    exit /b 1
)
echo  [OK] Backend dependencies installed
cd ..

:: ─── Step 5: Install Frontend Dependencies ──────────────────────
echo.
echo  [..] Installing frontend dependencies...
cd frontend
call npm install --silent >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!!] Frontend dependency install failed.
    pause
    exit /b 1
)
echo  [OK] Frontend dependencies installed
cd ..

:: ─── Step 6: Launch Servers ─────────────────────────────────────
echo.
echo  =============================================
echo          Starting servers...
echo  =============================================
echo.

:: Start Backend in a new window
start "Career Coach - Backend (port 8000)" cmd /k "cd /d "%~dp0backend" && color 0B && echo. && echo  === BACKEND SERVER === && echo. && python -m uvicorn main:app --reload --port 8000"

:: Small delay so backend starts first
timeout /t 3 /nobreak >nul

:: Start Frontend in a new window
start "Career Coach - Frontend (port 5173)" cmd /k "cd /d "%~dp0frontend" && color 0D && echo. && echo  === FRONTEND SERVER === && echo. && npm run dev"

:: Wait for frontend to spin up
timeout /t 4 /nobreak >nul

:: ─── Step 7: Open in Browser ────────────────────────────────────
echo  [OK] Backend running at  : http://localhost:8000
echo  [OK] Frontend running at : http://localhost:5173
echo.
echo  Opening browser...
start "" "http://localhost:5173"

echo.
echo  =============================================
echo   All systems go! Close this window anytime.
echo   To stop: close the Backend + Frontend windows.
echo  =============================================
echo.
pause
