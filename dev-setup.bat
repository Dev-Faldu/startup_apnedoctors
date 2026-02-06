@echo off
REM ApneDoctors Development Setup

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║           🛠️  ApneDoctors Development Setup               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🚀 Setting up development environment...
echo.

REM Check Node.js
echo 📦 Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check npm
echo 📦 Checking npm...
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found
    pause
    exit /b 1
)
echo ✅ npm found

REM Install frontend dependencies
echo 🎨 Setting up frontend...
if exist "package.json" (
    echo Installing frontend dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Frontend setup failed
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ⚠️  package.json not found in current directory
)

REM Setup backend
echo 🔧 Setting up voice backend...
cd docs\self-hosted-backend\Backend
if exist "package-windows.json" (
    echo Installing backend dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Backend setup failed
        cd ..\..\..
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed

    REM Copy environment file
    if not exist ".env" (
        copy .env.windows .env >nul 2>&1
        echo ✅ Backend .env file created
    )
) else (
    echo ⚠️  package-windows.json not found
)
cd ..\..\..

REM Check Ollama
echo 🤖 Checking Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ Ollama is running
) else (
    echo ⚠️  Ollama not running - install from: https://ollama.ai/download/windows
)

REM Check n8n
echo 🔄 Checking n8n...
n8n --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ n8n is installed
) else (
    echo ⚠️  n8n not installed - install with: npm install -g n8n
)

echo.
echo 🎉 DEVELOPMENT SETUP COMPLETE!
echo ================================
echo.
echo 🚀 To run everything:
echo run-everything.bat
echo.
echo 🧪 To check status:
echo status-check.bat
echo.
echo 🎨 For frontend development:
echo npm run dev
echo.
echo 🔊 For voice backend development:
echo cd docs\self-hosted-backend\Backend
echo node voice-ai-backend-windows.js
echo.
echo 📋 MANUAL STEPS STILL NEEDED:
echo ===============================
echo • Download Piper TTS: setup-piper-manual.bat
echo • Import n8n workflows: docs\n8n-workflows/
echo • Configure Supabase credentials in .env
echo.

pause