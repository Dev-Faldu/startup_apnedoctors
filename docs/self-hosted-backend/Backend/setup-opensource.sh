#!/bin/bash

# =============================================================================
# ApneDoctors Voice AI - Open Source Setup Script
# One command to set up the entire stack with zero API costs
# =============================================================================

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🚀 ApneDoctors Voice AI - Open Source Setup            ║"
echo "║  💰 Zero API costs - 100% free AI models                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Please don't run this script as root"
   exit 1
fi

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo "📋 Detected OS: $OS"
echo ""

# =============================================================================
# 1. INSTALL SYSTEM DEPENDENCIES
# =============================================================================

echo "📦 Step 1/6: Installing system dependencies..."

if [ "$OS" == "linux" ]; then
    sudo apt-get update
    sudo apt-get install -y curl wget git python3 python3-pip nodejs npm ffmpeg
elif [ "$OS" == "mac" ]; then
    brew install python3 node npm ffmpeg
fi

echo "✅ System dependencies installed"
echo ""

# =============================================================================
# 2. INSTALL OLLAMA (LLM)
# =============================================================================

echo "🧠 Step 2/6: Installing Ollama (Llama 3.1)..."

if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
    echo "✅ Ollama installed"
else
    echo "✅ Ollama already installed"
fi

# Start Ollama service
echo "🚀 Starting Ollama service..."
ollama serve > /dev/null 2>&1 &
OLLAMA_PID=$!
sleep 5

# Pull Llama 3.1 model
echo "📥 Downloading Llama 3.1 (this may take a few minutes)..."
ollama pull llama3.1

echo "✅ Ollama ready with Llama 3.1"
echo ""

# =============================================================================
# 3. INSTALL WHISPER (STT)
# =============================================================================

echo "🎙️  Step 3/6: Installing Whisper (Speech Recognition)..."

pip3 install faster-whisper flask

# Create Whisper server
cat > whisper_server.py << 'EOF'
from faster_whisper import WhisperModel
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

print("🔧 Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("✅ Whisper model loaded")

@app.route('/asr', methods=['POST'])
def transcribe():
    audio_file = request.files['audio_file']
    audio_path = '/tmp/temp_audio.wav'
    audio_file.save(audio_path)
    
    segments, info = model.transcribe(audio_path, beam_size=5)
    text = " ".join([segment.text for segment in segments])
    
    os.remove(audio_path)
    return jsonify({"text": text})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
EOF

# Start Whisper server
echo "🚀 Starting Whisper server..."
python3 whisper_server.py > whisper.log 2>&1 &
WHISPER_PID=$!
sleep 10

echo "✅ Whisper ready"
echo ""

# =============================================================================
# 4. INSTALL PIPER TTS (Text-to-Speech)
# =============================================================================

echo "🗣️  Step 4/6: Installing Piper TTS..."

if [ "$OS" == "linux" ]; then
    wget -q https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
    tar -xzf piper_amd64.tar.gz
    rm piper_amd64.tar.gz
elif [ "$OS" == "mac" ]; then
    wget -q https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_macos.tar.gz
    tar -xzf piper_macos.tar.gz
    rm piper_macos.tar.gz
fi

# Download voice model
echo "📥 Downloading voice model..."
wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
wget -q https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

echo "✅ Piper TTS ready"
echo ""

# =============================================================================
# 5. INSTALL NODE.JS DEPENDENCIES
# =============================================================================

echo "📦 Step 5/6: Installing Node.js dependencies..."

npm install

echo "✅ Node.js dependencies installed"
echo ""

# =============================================================================
# 6. CONFIGURE ENVIRONMENT
# =============================================================================

echo "⚙️  Step 6/6: Configuring environment..."

if [ ! -f .env ]; then
    cp env-opensource.example .env
    echo "✅ Created .env file"
    echo "📝 Please edit .env to add your Fonoster credentials"
else
    echo "✅ .env file already exists"
fi

echo ""

# =============================================================================
# TEST SERVICES
# =============================================================================

echo "🧪 Testing services..."

# Test Ollama
echo -n "Testing Ollama... "
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅"
else
    echo "❌ Failed"
fi

# Test Whisper
echo -n "Testing Whisper... "
if curl -s http://localhost:9000/health > /dev/null; then
    echo "✅"
else
    echo "❌ Failed"
fi

echo ""

# =============================================================================
# COMPLETE
# =============================================================================

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Your Open Source AI Stack:"
echo "   • Ollama (Llama 3.1) - Running on port 11434"
echo "   • Whisper - Running on port 9000"
echo "   • Piper TTS - Ready"
echo ""
echo "💰 Monthly Cost: \$0 for AI (just server hosting)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Edit .env with your configuration"
echo "   2. Start the backend: npm start"
echo "   3. Test: curl http://localhost:3001/health"
echo ""
echo "📖 Documentation:"
echo "   • OPENSOURCE_SETUP_GUIDE.md - Detailed setup"
echo "   • DEPLOYMENT_GUIDE.md - Production deployment"
echo ""
echo "🆘 Troubleshooting:"
echo "   • Check Ollama: ollama ps"
echo "   • Check Whisper: curl http://localhost:9000/health"
echo "   • View logs: tail -f whisper.log"
echo ""

# Save PIDs for cleanup
cat > .pids << EOF
OLLAMA_PID=$OLLAMA_PID
WHISPER_PID=$WHISPER_PID
EOF

echo "📝 Service PIDs saved to .pids"
echo ""
echo "To stop services: bash stop-services.sh"
echo "To start backend: npm start"
echo ""
echo "Happy coding! 🎉"
