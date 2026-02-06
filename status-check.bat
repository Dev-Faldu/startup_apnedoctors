@echo off
REM ApneDoctors System Status Checker

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║            📊 ApneDoctors System Status                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🔍 Checking all components...
echo.

REM Frontend (Vercel)
echo 🌐 FRONTEND (Vercel)
curl -s -I https://startup-apnedoctors.vercel.app | findstr HTTP >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Live: https://startup-apnedoctors.vercel.app
) else (
    echo ❌ Down: https://startup-apnedoctors.vercel.app
)
echo.

REM Supabase
echo 🗄️  BACKEND (Supabase)
curl -s -I https://startup-apnedoctors.vercel.app/api/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Supabase: Connected via Vercel
) else (
    echo ⚠️  Supabase: Check environment variables
)
echo.

REM Voice Backend
echo 🔊 VOICE AI BACKEND
netstat -ano | findstr :54112 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Running: http://localhost:54112
    curl -s http://localhost:54112/health | findstr healthy >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Health: Good
    ) else (
        echo ⚠️  Health: Responding but issues
    )
) else (
    echo ❌ Not running: Run voice-ai-backend-windows.js
)
echo.

REM Ollama
echo 🤖 OLLAMA LLM
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ Process: Running
    curl -s http://localhost:11500/api/tags >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ API: http://localhost:11500
    ) else (
        echo ❌ API: Not responding
    )
) else (
    echo ❌ Not running: ollama serve
)
echo.

REM n8n
echo 🔄 N8N WORKFLOWS
netstat -ano | findstr :5678 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Running: http://localhost:5678
    curl -s http://localhost:5678/healthz >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Health: Good
    ) else (
        echo ⚠️  Health: Starting up
    )
) else (
    echo ❌ Not running: n8n start
)
echo.

REM Component Status
echo 📋 COMPONENT STATUS
echo ===================

REM Transformers.js
if exist "docs\self-hosted-backend\Backend\node_modules\@xenova\transformers" (
    echo ✅ Transformers.js: Installed
) else (
    echo ❌ Transformers.js: Not installed
)

REM Piper TTS
if exist "docs\self-hosted-backend\Backend\piper.exe" (
    echo ✅ Piper TTS: Downloaded
) else (
    echo ⚠️  Piper TTS: Manual download needed
)

REM Models directory
if exist "docs\self-hosted-backend\Backend\models" (
    dir /b "docs\self-hosted-backend\Backend\models" 2>nul | findstr . >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Voice Models: Available
    ) else (
        echo ⚠️  Voice Models: Directory empty
    )
) else (
    echo ❌ Models Directory: Missing
)

REM Workflows
if exist "docs\n8n-workflows" (
    dir /b "docs\n8n-workflows\*.json" 2>nul | find /c ".json" > temp_count.txt
    set /p workflow_count=<temp_count.txt
    del temp_count.txt 2>nul
    echo ✅ n8n Workflows: %workflow_count% available
) else (
    echo ❌ n8n Workflows: Missing
)

echo.
echo 🎯 OVERALL STATUS
echo ================

REM Count healthy components
set healthy_count=0

curl -s https://startup-apnedoctors.vercel.app >nul 2>&1 && set /a healthy_count+=1
netstat -ano | findstr :54112 >nul 2>&1 && set /a healthy_count+=1
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL && set /a healthy_count+=1
netstat -ano | findstr :5678 >nul 2>&1 && set /a healthy_count+=1

if %healthy_count% EQU 4 (
    echo 🟢 FULLY OPERATIONAL (4/4 components)
    echo.
    echo 🎉 Ready for medical consultations!
) else (
    echo 🟡 PARTIALLY OPERATIONAL (%healthy_count%/4 components)
    echo.
    echo 🔧 Run: run-everything.bat
)

echo.
pause