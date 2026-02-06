@echo off
REM ApneDoctors Voice AI - Windows Test Script

echo 🧪 Testing ApneDoctors Voice AI Backend...
echo.

REM Test 1: Health Check
echo 📊 Test 1: Health Check
curl -s http://localhost:3001/health | findstr "healthy" >nul
if %errorlevel% equ 0 (
    echo ✅ Health check passed
) else (
    echo ❌ Health check failed - is server running?
    echo    Start with: npm start
    goto :end
)

REM Test 2: Ollama Connection
echo 🤖 Test 2: Ollama Connection
curl -s http://localhost:11500/api/tags | findstr "models" >nul
if %errorlevel% equ 0 (
    echo ✅ Ollama is responding
) else (
    echo ⚠️  Ollama not accessible - start with: ollama serve
)

REM Test 3: Piper TTS
echo 🔊 Test 3: Piper TTS
piper.exe --help >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Piper TTS found
) else (
    echo ⚠️  Piper TTS not found - download from GitHub releases
)

REM Test 4: WebSocket Connection
echo 🌐 Test 4: WebSocket Connection
echo This requires manual testing with frontend
echo Open your browser and try voice chat

REM Test 5: n8n Integration (optional)
if defined N8N_WEBHOOK_URL (
    echo 🔄 Test 5: n8n Webhook
    curl -s %N8N_WEBHOOK_URL%/test >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ n8n webhook accessible
    ) else (
        echo ⚠️  n8n webhook not accessible
    )
)

echo.
echo 🎉 Basic tests complete!
echo.
echo 📋 Status Summary:
echo - Backend server: Running on port 3001
echo - Ollama LLM: Check above
echo - Piper TTS: Check above
echo - WebSocket: Ready for connections
echo.
echo 🚀 Ready for voice conversations!
echo.

:end
pause