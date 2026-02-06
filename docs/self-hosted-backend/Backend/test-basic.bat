@echo off
REM Basic functionality test for ApneDoctors Voice Backend

echo 🧪 Testing ApneDoctors Voice Backend...
echo.

REM Test 1: Server running
echo 📡 Test 1: Server Status
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :54112') do (
    echo ✅ Server running on port 54112 (PID: %%a)
    goto :server_ok
)
echo ❌ Server not running on port 54112
echo    Start with: node voice-ai-backend-windows.js
goto :end

:server_ok
echo.

REM Test 2: Health endpoint
echo 🌡️  Test 2: Health Check
curl -s http://localhost:54112/health > health_response.txt 2>nul
if %errorlevel% equ 0 (
    echo ✅ Health endpoint responding
    type health_response.txt
) else (
    echo ❌ Health endpoint not responding
)
del health_response.txt 2>nul
echo.

REM Test 3: Ollama
echo 🤖 Test 3: Ollama Status
curl -s -w "%%{http_code}" -o /dev/null http://localhost:11500/api/tags > ollama_code.txt 2>nul
set /p ollama_code=<ollama_code.txt
if "%ollama_code%"=="200" (
    echo ✅ Ollama responding
) else (
    echo ⚠️  Ollama not responding (code: %ollama_code%)
)
del ollama_code.txt 2>nul
echo.

REM Test 4: Piper
echo 🔊 Test 4: Piper TTS
piper.exe --help >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Piper TTS available
    echo    Voice models in: models/ folder
) else (
    echo ⚠️  Piper TTS not found
    echo    Run: download-piper.bat
)
echo.

REM Test 5: Transformers.js
echo 🎯 Test 5: Transformers.js
node -e "try { require('@xenova/transformers'); console.log('✅ Transformers.js available'); } catch(e) { console.log('❌ Transformers.js missing - npm install @xenova/transformers'); }"
echo.

echo 📊 SUMMARY
echo ===========
echo ✅ Server: Running
if "%ollama_code%"=="200" (echo ✅ LLM: Ollama ready) else (echo ❌ LLM: Ollama issues)
piper.exe --help >nul 2>&1 && echo ✅ TTS: Piper ready || echo ❌ TTS: Piper missing
node -e "try { require('@xenova/transformers'); process.exit(0); } catch(e) { process.exit(1); }" >nul 2>&1 && echo ✅ STT: Transformers.js ready || echo ❌ STT: Transformers.js missing
echo.

echo 🚀 READY FOR TESTING:
echo 1. Open browser: http://localhost:54112/health
echo 2. WebSocket URL: ws://localhost:54112
echo 3. Frontend can now connect!
echo.

:end
pause