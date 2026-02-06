@echo off
REM Manual Piper Setup for Windows

echo 🔧 MANUAL PIPER SETUP REQUIRED
echo ===============================
echo.
echo Since automatic download failed, please follow these steps:
echo.
echo 📥 STEP 1: Download Piper executable
echo    Go to: https://github.com/rhasspy/piper/releases
echo    Download: piper_windows_amd64.zip (latest version)
echo    Extract to: D:\startup_apnedoctors\docs\self-hosted-backend\Backend\
echo.
echo 📥 STEP 2: Download voice model
echo    Go to: https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium
echo    Download: en_US-lessac-medium.onnx
echo    Download: en_US-lessac-medium.onnx.json
echo    Save to: D:\startup_apnedoctors\docs\self-hosted-backend\Backend\models\
echo.
echo 📁 FINAL FOLDER STRUCTURE:
echo D:\startup_apnedoctors\docs\self-hosted-backend\Backend\
echo ├── piper.exe
echo └── models\
echo     ├── en_US-lessac-medium.onnx
echo     └── en_US-lessac-medium.onnx.json
echo.
echo 🧪 TEST PIPER:
echo piper.exe --help
echo.
echo 🎤 TEST VOICE:
echo echo "Hello from ApneDoctors" ^| piper.exe --model models/en_US-lessac-medium.onnx --output_file test.wav
echo.
pause