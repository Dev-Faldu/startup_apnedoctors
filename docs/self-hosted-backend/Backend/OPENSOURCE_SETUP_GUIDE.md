# 🆓 Open Source AI Setup Guide
## Zero API Costs - Complete Self-Hosted Solution

This guide shows you how to run **ApneDoctors Voice AI** with **100% free, open-source models**.

**Monthly Cost: $0** (just server hosting ~$10-50/month)

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Your Voice AI Stack (All Open Source & Free)          │
├─────────────────────────────────────────────────────────┤
│  STT:  Whisper (OpenAI's open-source model)            │
│  LLM:  Llama 3.1 / Mistral (via Ollama)                │
│  TTS:  Coqui TTS / Piper (open-source synthesis)       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Option 1: Full Stack (Recommended for Production)

### Step 1: Install Ollama (LLM - Llama 3)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve

# Pull Llama 3.1 model (8B parameters - best balance)
ollama pull llama3.1

# Or use smaller model for lower RAM
ollama pull llama3.1:7b

# Or use Mistral (faster, good for medical)
ollama pull mistral

# Test it
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Hello, how are you?"
}'
```

**Memory Requirements:**
- Llama 3.1 8B: ~8GB RAM
- Llama 3.1 7B: ~6GB RAM  
- Mistral 7B: ~6GB RAM

### Step 2: Install Whisper (STT - Speech Recognition)

**Option A: faster-whisper (Recommended - 4x faster)**

```bash
# Install Python and dependencies
pip install faster-whisper

# Create simple server
cat > whisper_server.py << 'EOF'
from faster_whisper import WhisperModel
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Load model (downloads once, ~300MB)
model = WhisperModel("base", device="cpu", compute_type="int8")
# Options: tiny, base, small, medium, large-v3

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

# Install Flask
pip install flask

# Run Whisper server
python whisper_server.py

# Test it
curl -X POST http://localhost:9000/asr \
  -F "audio_file=@test.wav"
```

**Option B: whisper.cpp (Even faster, C++ implementation)**

```bash
# Clone and build
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
make

# Download model
bash ./models/download-ggml-model.sh base

# Run server
./server -m models/ggml-base.bin

# Test
curl http://localhost:8080/inference \
  -H "Content-Type: multipart/form-data" \
  -F file="@test.wav"
```

### Step 3: Install Coqui TTS (Text-to-Speech)

**Option A: Coqui TTS (High quality)**

```bash
# Install
pip install TTS

# Start server
tts-server --model_name tts_models/en/ljspeech/tacotron2-DDC

# Test
curl "http://localhost:5002/api/tts?text=Hello%20from%20ApneDoctors"
```

**Option B: Piper TTS (Fastest, lightest - RECOMMENDED)**

```bash
# Download Piper
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
tar -xzf piper_amd64.tar.gz

# Download voice model
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx

# Test
echo "Hello from ApneDoctors" | ./piper \
  --model en_US-lessac-medium.onnx \
  --output_file output.wav
```

---

## 🚀 Option 2: Transformers.js (Runs in Node.js - NO Python!)

**Ultra-simple setup - Everything runs in your Node.js app!**

```bash
# Just install one package
npm install @xenova/transformers

# That's it! Models download automatically on first use
```

Update your backend to use Transformers.js:

```javascript
const { pipeline } = require('@xenova/transformers');

// Initialize (runs once, caches models)
const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
const generator = await pipeline('text-generation', 'Xenova/llama-160m');
const tts = await pipeline('text-to-speech', 'Xenova/speecht5_tts');

// Use in your code
const transcript = await asr(audioBuffer);
const response = await generator(prompt);
const audio = await tts(text);
```

**Pros:**
- ✅ No Python dependencies
- ✅ Runs entirely in Node.js
- ✅ Auto-downloads and caches models
- ✅ Simplest setup

**Cons:**
- ❌ Smaller models (lower quality)
- ❌ Slower than native implementations

---

## 🚀 Option 3: LocalAI (All-in-One Solution)

**Single Docker container for everything!**

```bash
# One command to rule them all
docker run -p 8080:8080 --name localai -ti \
  localai/localai:latest-aio-cpu

# LocalAI includes:
# - Whisper for STT
# - Llama 3 for LLM
# - Bark for TTS
# All in one container!

# Configure your backend
WHISPER_API=http://localhost:8080/v1/audio/transcriptions
OLLAMA_API=http://localhost:8080/v1/chat/completions
COQUI_TTS_API=http://localhost:8080/tts
```

**Pros:**
- ✅ Easiest deployment
- ✅ One container = everything
- ✅ OpenAI-compatible API

---

## 📊 Model Comparison

| Model | Size | Quality | Speed | RAM | Best For |
|-------|------|---------|-------|-----|----------|
| **STT** |
| Whisper Tiny | 75MB | Good | Very Fast | 1GB | Real-time |
| Whisper Base | 300MB | Better | Fast | 2GB | **Recommended** |
| Whisper Small | 500MB | Great | Medium | 3GB | High accuracy |
| **LLM** |
| Llama 3.1 7B | 4GB | Excellent | Medium | 6GB | **Recommended** |
| Mistral 7B | 4GB | Excellent | Fast | 6GB | Speed focus |
| Llama 3.1 8B | 5GB | Best | Medium | 8GB | Quality focus |
| **TTS** |
| Piper | 50MB | Good | Very Fast | 500MB | **Recommended** |
| Coqui | 200MB | Excellent | Medium | 2GB | Quality focus |

---

## 💻 Server Requirements

### Minimum (Development)
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 20GB SSD
- **Cost:** ~$10-20/month (Hetzner, DigitalOcean)

### Recommended (Production)
- **CPU:** 8 cores
- **RAM:** 16GB
- **Storage:** 50GB SSD
- **Cost:** ~$40-60/month

### Optimal (High Volume)
- **CPU:** 16 cores
- **RAM:** 32GB
- **GPU:** Optional (speeds up by 10x)
- **Storage:** 100GB SSD
- **Cost:** ~$100-150/month

---

## 🐳 Docker Setup (Production)

Create `docker-compose.opensource.yml`:

```yaml
version: '3.8'

services:
  # Ollama (LLM)
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    restart: unless-stopped

  # Whisper Server
  whisper:
    build:
      context: .
      dockerfile: Dockerfile.whisper
    ports:
      - "9000:9000"
    restart: unless-stopped

  # Coqui TTS
  tts:
    image: synesthesiam/coqui-tts:latest
    ports:
      - "5002:5002"
    command: --model_name tts_models/en/ljspeech/tacotron2-DDC
    restart: unless-stopped

  # Voice AI Backend
  voice-ai:
    build: .
    ports:
      - "3001:3001"
    environment:
      - WHISPER_API=http://whisper:9000
      - OLLAMA_API=http://ollama:11434
      - COQUI_TTS_API=http://tts:5002
    depends_on:
      - ollama
      - whisper
      - tts
    restart: unless-stopped

volumes:
  ollama-data:
```

**Dockerfile.whisper:**

```dockerfile
FROM python:3.10-slim

RUN pip install faster-whisper flask

COPY whisper_server.py /app/whisper_server.py

WORKDIR /app

CMD ["python", "whisper_server.py"]
```

**Start everything:**

```bash
docker-compose -f docker-compose.opensource.yml up -d
```

---

## 🧪 Testing Your Setup

### Test Whisper (STT)

```bash
# Record test audio
arecord -d 3 -f cd test.wav

# Transcribe
curl -X POST http://localhost:9000/asr \
  -F "audio_file=@test.wav"
```

### Test Ollama (LLM)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "You are a medical AI. A patient says: I have a headache. Respond calmly.",
  "stream": false
}'
```

### Test TTS

```bash
curl "http://localhost:5002/api/tts?text=Hello%20this%20is%20a%20test" \
  --output test-tts.wav

# Play it
aplay test-tts.wav
```

---

## 🔧 Environment Configuration

Update your `.env`:

```bash
# Open Source AI Services
WHISPER_API=http://localhost:9000
OLLAMA_API=http://localhost:11434
COQUI_TTS_API=http://localhost:5002

# Or use Transformers.js (no separate services needed)
USE_TRANSFORMERS_JS=true

# Model Selection
OLLAMA_MODEL=llama3.1        # or mistral, mixtral, etc.
WHISPER_MODEL=base           # or tiny, small, medium
TTS_VOICE=en_US-lessac-medium

# Rest stays the same
FONOSTER_API_URL=http://localhost:50051
N8N_WEBHOOK_URL=https://your-n8n.com/webhook
```

---

## ⚡ Performance Optimization

### 1. Use Quantized Models

```bash
# Llama 3 with 4-bit quantization (uses 50% less RAM)
ollama pull llama3.1:7b-q4_0

# Or 8-bit
ollama pull llama3.1:7b-q8_0
```

### 2. Enable GPU Acceleration

```bash
# For Ollama
ollama pull llama3.1 --gpu

# For Whisper
pip install faster-whisper[gpu]

# Update whisper_server.py
model = WhisperModel("base", device="cuda")
```

### 3. Use Model Caching

All models cache automatically after first download. Subsequent runs are instant.

---

## 💰 Cost Breakdown

### Open Source Stack
| Item | Cost |
|------|------|
| Models | $0 (free) |
| API calls | $0 (self-hosted) |
| **Server (16GB RAM)** | **$40/month** |
| **Total** | **$40/month** |

### vs. Paid APIs (1000 calls/month)
| Service | Cost |
|---------|------|
| Deepgram | $15-20 |
| OpenAI/Claude | $30-40 |
| ElevenLabs | $20-30 |
| Server | $10 |
| **Total** | **$75-100/month** |

**Savings: 50-60% with open source!**

At scale (10,000 calls/month):
- **Open Source:** $80-100/month (just bigger server)
- **Paid APIs:** $750-1000/month

**At scale, you save 80-90%!**

---

## 🚀 Quick Start Script

```bash
#!/bin/bash
# setup-opensource-ai.sh

echo "🚀 Setting up open-source AI stack..."

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
sleep 5
ollama pull llama3.1

# Install Whisper
pip install faster-whisper flask
python whisper_server.py &

# Install Piper TTS
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
tar -xzf piper_amd64.tar.gz
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx

# Start Voice AI Backend
npm install
npm start

echo "✅ All services running!"
echo "📊 Check status at http://localhost:3001/health"
```

---

## 🎯 Recommended Setup for ApneDoctors

**For Development:**
```
- Transformers.js (simplest)
- OR LocalAI Docker (all-in-one)
```

**For Production:**
```
- Whisper Base (STT) - fastest-whisper
- Llama 3.1 8B (LLM) - via Ollama  
- Piper (TTS) - lightest & fastest
- Server: 16GB RAM, 8 CPU cores
```

---

## 🆘 Troubleshooting

**Ollama not responding:**
```bash
ollama ps  # Check running models
ollama serve  # Restart service
```

**Whisper out of memory:**
```bash
# Use smaller model
ollama pull llama3.1:7b-q4_0
```

**Slow TTS generation:**
```bash
# Switch to Piper (10x faster)
./piper --model en_US-lessac-medium.onnx
```

---

## 🎉 You're Ready!

Your completely free, open-source voice AI system is now running!

**Next:**
1. Start the backend: `npm start`
2. Test the health endpoint: `curl http://localhost:3001/health`
3. Make your first call!

**Zero monthly API costs. Full control. Production-ready.** 🚀
