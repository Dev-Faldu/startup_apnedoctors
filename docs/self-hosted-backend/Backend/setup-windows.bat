@echo off
REM ApneDoctors Voice AI - Windows Setup Script

echo 🚀 Setting up ApneDoctors Voice AI for Windows...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Install dependencies
echo ⏳ Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Create models directory
if not exist "models" mkdir models

REM Check Ollama
echo ⏳ Checking Ollama...
curl -s http://localhost:11500/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Ollama not running or not accessible
    echo Please start Ollama with: ollama serve
    echo And pull a model: ollama pull llama2
    echo.
) else (
    echo ✅ Ollama is running
)

REM Check Piper
echo ⏳ Checking Piper TTS...
piper.exe --help >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Piper not found in PATH
    echo.
    echo 📥 Download Piper from:
    echo https://github.com/rhasspy/piper/releases
    echo.
    echo 📥 Download voice model:
    echo https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx
    echo.
    echo 📁 Place files in:
    echo - piper.exe → C:\Windows\System32\ or add to PATH
    echo - en_US-lessac-medium.onnx → ./models/ folder
    echo.
) else (
    echo ✅ Piper TTS found
)

REM Copy environment file
if not exist ".env" (
    copy .env.windows .env
    echo ✅ Created .env file from template
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 To start the server:
echo npm start
echo.
echo 🧪 Test the server:
echo curl http://localhost:3001/health
echo.
echo 📋 Next steps:
echo 1. Make sure Ollama is running: ollama serve
echo 2. Ensure Piper is in PATH or in current directory
echo 3. Run: npm start
echo 4. Test WebSocket connection from frontend
echo.
pause