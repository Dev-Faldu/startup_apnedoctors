@echo off
REM Download Piper TTS for Windows

echo 🚀 Downloading Piper TTS for ApneDoctors...
echo.

REM Create models directory
if not exist "models" mkdir models

REM Download Piper executable
echo 📥 Downloading Piper executable...
powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_windows_amd64.zip' -OutFile 'piper.zip'}"
if %errorlevel% neq 0 (
    echo ❌ Failed to download Piper
    pause
    exit /b 1
)

REM Extract Piper
echo 📦 Extracting Piper...
powershell -Command "& {Expand-Archive -Path 'piper.zip' -DestinationPath '.' -Force}"
move piper_windows_amd64\piper.exe . 2>nul
rmdir /s /q piper_windows_amd64 2>nul
del piper.zip

REM Download voice model
echo 🎤 Downloading English voice model...
powershell -Command "& {Invoke-WebRequest -Uri 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx' -OutFile 'models\en_US-lessac-medium.onnx'}"
powershell -Command "& {Invoke-WebRequest -Uri 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json' -OutFile 'models\en_US-lessac-medium.onnx.json'}"

echo ✅ Piper setup complete!
echo.
echo 📁 Files downloaded:
echo - piper.exe (TTS executable)
echo - models/en_US-lessac-medium.onnx (voice model)
echo - models/en_US-lessac-medium.onnx.json (model config)
echo.
echo 🧪 Test Piper:
echo piper.exe --model models/en_US-lessac-medium.onnx --output_file test.wav
echo echo "Hello from ApneDoctors" ^| piper.exe --model models/en_US-lessac-medium.onnx --output_file test.wav
echo.
pause