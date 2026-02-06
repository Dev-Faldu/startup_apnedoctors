@echo off
REM ApneDoctors N8N Setup Script for Windows
echo 🚀 Setting up N8N for ApneDoctors...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Create n8n directory
if not exist "n8n-data" mkdir n8n-data

REM Run N8N with Docker
docker run -d ^
  --name apnedoctors-n8n ^
  -p 5678:5678 ^
  -v "%cd%\n8n-data:/home/node/.n8n" ^
  -e N8N_BASIC_AUTH_ACTIVE=true ^
  -e N8N_BASIC_AUTH_USER=admin ^
  -e N8N_BASIC_AUTH_PASSWORD=apnedoctors2024 ^
  n8nio/n8n:latest

echo ✅ N8N is starting up...
echo.
echo 📋 Access Information:
echo URL: http://localhost:5678
echo Username: admin
echo Password: apnedoctors2024
echo.
echo 📚 Next Steps:
echo 1. Open http://localhost:5678 in your browser
echo 2. Import workflows from docs/n8n-workflows/
echo 3. Configure webhook URLs in MedicalAIService.ts
echo 4. Set up credentials (SMTP, Twilio, Supabase, etc.)
echo.
echo 🛑 To stop N8N: docker stop apnedoctors-n8n
echo 🗑️  To remove: docker rm apnedoctors-n8n
echo.
pause