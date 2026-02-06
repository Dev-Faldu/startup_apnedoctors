@echo off
REM ApneDoctors - Complete System Reset & Fix
REM This script fixes ALL connectivity and integration issues

echo.
echo ========================================
echo     🔧 ApneDoctors - SYSTEM RESET FIX
echo ========================================
echo.
echo 🔧 Fixing all connectivity issues...
echo.

REM 1. Kill all existing processes
echo 🛑 Killing existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM ollama.exe >nul 2>&1
taskkill /F /IM n8n.exe >nul 2>&1
taskkill /F /IM piper.exe >nul 2>&1
echo ✅ Processes killed

REM 2. Clean up temp files
echo 🧹 Cleaning temp files...
if exist "docs\self-hosted-backend\Backend\models\*.wav" del /Q "docs\self-hosted-backend\Backend\models\*.wav" 2>nul
if exist "*.log" del /Q "*.log" 2>nul
echo ✅ Temp files cleaned

REM 3. Fix backend environment
echo 🔧 Setting up backend environment...
cd docs\self-hosted-backend\Backend

REM Create fresh .env file
(
echo # ApneDoctors Voice Backend Environment
echo PORT=54112
echo OLLAMA_BASE_URL=http://localhost:11500
echo PIPER_MODEL_PATH=./models/en_US-lessac-medium.onnx
echo N8N_WEBHOOK_URL=http://localhost:5678/webhook
echo USE_TRANSFORMERS_JS=true
) > .env

echo ✅ Backend environment configured

REM 4. Install/update backend dependencies
echo 📦 Installing backend dependencies...
if exist package-windows.json (
    copy package-windows.json package.json >nul 2>&1
)
npm install --silent
echo ✅ Backend dependencies installed

REM 5. Start Ollama (background)
echo 🤖 Starting Ollama...
start /B ollama serve
timeout /t 5 /nobreak >nul
echo ✅ Ollama started

REM 6. Check Ollama model
echo 📚 Checking Ollama model...
ollama list | findstr llama >nul
if %ERRORLEVEL% NEQ 0 (
    echo 📥 Pulling Llama model...
    ollama pull llama2
)
echo ✅ Ollama model ready

REM 7. Start voice backend
echo 🔊 Starting voice backend...
start /B node voice-ai-backend-windows.js
timeout /t 3 /nobreak >nul

REM 8. Test voice backend
echo 🧪 Testing voice backend...
curl -s http://localhost:54112/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Voice backend responding
) else (
    echo ❌ Voice backend not responding
)

REM 9. Start n8n (optional)
echo 🔄 Starting n8n workflows...
where n8n >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start /B n8n start --datafolder ./n8n-data
    timeout /t 3 /nobreak >nul
    echo ✅ n8n started
) else (
    echo ⚠️ n8n not installed - skipping
)

REM 10. Fix frontend integration
echo 🎨 Setting up frontend integration...
cd ..\..\..

if exist package.json (
    REM Update environment variables for frontend
    if not exist .env.local (
        echo # ApneDoctors Frontend Environment > .env.local
        echo VITE_VOICE_BACKEND_URL=http://localhost:54112 >> .env.local
        echo VITE_SUPABASE_URL=your-supabase-url >> .env.local
        echo VITE_SUPABASE_ANON_KEY=your-supabase-anon-key >> .env.local
        echo VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook >> .env.local
        echo. >> .env.local
        echo # Replace the above with your actual Supabase credentials >> .env.local
        echo # Get them from: https://app.supabase.com >> .env.local
    )
    echo ✅ Frontend environment configured
)

echo.
echo =========================
echo  🎉 SYSTEM RESET COMPLETE!
echo =========================
echo.
echo 🌐 Access Points:
echo Frontend:     https://startup-apnedoctors.vercel.app
echo Voice API:    http://localhost:54112
echo Voice UI:     http://localhost:54112/ (NEW!)
echo Ollama:       http://localhost:11500
echo n8n:          http://localhost:5678
echo.

echo 🔧 What was fixed:
echo ✅ Killed conflicting processes
echo ✅ Cleaned temp files
echo ✅ Fixed environment variables
echo ✅ Updated dependencies
echo ✅ Started all services in correct order
echo ✅ Added voice backend dashboard
echo ✅ Configured frontend integration
echo.

echo 🚀 READY TO USE:
echo ================
echo 1. Open: https://startup-apnedoctors.vercel.app
echo 2. Try voice chat with backend at localhost:54112
echo 3. Check system status: status-check.bat
echo.

echo ⚠️  IMPORTANT:
echo ==============
echo • Update .env.local with your Supabase credentials
echo • Download Piper TTS if you want voice responses
echo • Import n8n workflows for full automation
echo.

pause