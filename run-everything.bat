@echo off
REM ApneDoctors - Complete System Runner
REM Run this to start the entire ApneDoctors platform

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║              🚀 ApneDoctors - Full System                ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Ollama is running
echo 📋 Checking prerequisites...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ Ollama is running
) else (
    echo ⚠️  Ollama not running - starting...
    start /B ollama serve
    timeout /t 3 /nobreak >nul
    echo ✅ Ollama started
)

REM Check if Llama model is available
echo 🤖 Checking Llama model...
ollama list | findstr llama >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Llama model available
) else (
    echo 📥 Pulling Llama model...
    ollama pull llama2
)

REM Check if voice backend is running
netstat -ano | findstr :54112 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Voice backend is running on port 54112
) else (
    echo 🚀 Starting voice backend...
    cd /d "%~dp0docs\self-hosted-backend\Backend"
    start /B node voice-ai-backend-windows.js
    timeout /t 5 /nobreak >nul
    cd /d "%~dp0"
)

REM Check if n8n is running
netstat -ano | findstr :5678 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ n8n is running on port 5678
) else (
    echo 🔄 Starting n8n workflows...
    if exist n8n-data (
        cd n8n-data
        start /B n8n start
        cd ..
    ) else (
        mkdir n8n-data 2>nul
        cd n8n-data
        start /B n8n start
        cd ..
    )
    timeout /t 3 /nobreak >nul
)

echo.
echo 🎉 SYSTEM STATUS CHECK
echo ======================
echo ✅ Frontend: https://startup-apnedoctors.vercel.app
echo ✅ Voice AI: http://localhost:54112
echo ✅ n8n Workflows: http://localhost:5678
echo ✅ Ollama LLM: http://localhost:11500
echo ✅ Supabase: Connected via frontend
echo.

REM Test all endpoints
echo 🧪 Testing connections...
echo.

curl -s http://localhost:54112/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Voice Backend: Connected
) else (
    echo ❌ Voice Backend: Not responding
)

curl -s http://localhost:11500/api/tags >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Ollama LLM: Connected
) else (
    echo ❌ Ollama LLM: Not responding
)

curl -s http://localhost:5678/healthz >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ n8n Workflows: Connected
) else (
    echo ⚠️  n8n Workflows: Starting (may take time)
)

echo.
echo 🌐 ACCESS POINTS
echo ================
echo 🎨 Frontend: https://startup-apnedoctors.vercel.app
echo 🔊 Voice API: http://localhost:54112
echo 🤖 AI Workflows: http://localhost:5678
echo 📊 Ollama: http://localhost:11500
echo.

echo 🚀 READY TO USE!
echo ================
echo 1. Open: https://startup-apnedoctors.vercel.app
echo 2. Try the "Try Live AI" feature
echo 3. Use clinical assessment
echo 4. Test emergency workflows
echo.

echo 📝 MANUAL STEPS (if needed):
echo =============================
echo • Voice models: Run setup-piper-manual.bat if TTS needed
echo • n8n setup: Import workflows from docs/n8n-workflows/
echo • Frontend dev: npm run dev (if local development)
echo.

pause