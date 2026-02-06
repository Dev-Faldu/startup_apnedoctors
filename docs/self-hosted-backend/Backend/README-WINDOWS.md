# ApneDoctors Voice AI - Windows-Native Version

🪟 **100% Windows Compatible** - No WSL, Docker, or Linux required!

## Overview

This is the **Windows-native version** of the ApneDoctors voice AI backend, specifically designed to run on Windows without any Linux dependencies.

**Cost**: $0/month (only server hosting ~$10-50/month)

## Architecture

```
🎤 Browser Audio → WebSocket → Node.js Server → AI Pipeline → Audio Response
                                      ↓
                                ┌─────────────────┐
                                │ Transformers.js │ ← Whisper (STT)
                                │   (runs in      │
                                │   Node.js)      │
                                └─────────────────┘
                                      ↓
                                ┌─────────────────┐
                                │    Ollama       │ ← Llama 3 (LLM)
                                │ (Windows native)│
                                └─────────────────┘
                                      ↓
                                ┌─────────────────┐
                                │     Piper       │ ← TTS (Windows exe)
                                │   (Windows      │
                                │    binary)      │
                                └─────────────────┘
```

## Prerequisites

### Required Software
- ✅ **Node.js 18+** (download from nodejs.org)
- ✅ **Ollama** (for LLM)
- ✅ **Piper** (for TTS)

### Optional
- ⭕ **n8n** (for workflow automation)
- ⭕ **FFmpeg** (for audio processing)

## Quick Start

### 1. Clone & Setup
```bash
# Clone the repository
git clone <your-repo>
cd apnedoctors/docs/self-hosted-backend/Backend

# Run setup script
setup-windows.bat
```

### 2. Install AI Models

#### Ollama (LLM)
```bash
# Install Ollama
# Download from: https://ollama.ai/download/windows

# Start Ollama service
ollama serve

# Pull Llama model (in another terminal)
ollama pull llama2
```

#### Piper (TTS)
```bash
# Download Piper Windows binary
# From: https://github.com/rhasspy/piper/releases
# Place piper.exe in your PATH or current directory

# Download voice model
# From: https://huggingface.co/rhasspy/piper-voices
# File: en_US-lessac-medium.onnx
# Place in: ./models/ folder
```

### 3. Start the Server
```bash
npm start
```

### 4. Test
```bash
# Health check
curl http://localhost:3001/health

# Should return:
{
  "status": "healthy",
  "platform": "windows",
  "models": "transformers.js + ollama + piper",
  "cost": "$0/month"
}
```

## Configuration

### Environment Variables (.env)
```bash
# Copy from template
copy .env.windows .env

# Edit as needed
notepad .env
```

### Key Settings
- `PORT=3001` - Server port
- `OLLAMA_BASE_URL=http://localhost:11500` - Ollama endpoint
- `PIPER_MODEL_PATH=./models/en_US-lessac-medium.onnx` - Voice model path
- `N8N_WEBHOOK_URL=http://localhost:5678/webhook` - n8n integration

## How It Works

### 1. Audio Input
- Browser captures microphone audio
- Sends as WebSocket message (base64 encoded)

### 2. Speech-to-Text (Transformers.js)
- Uses `@xenova/transformers` library
- Whisper model runs directly in Node.js
- No external Python servers needed
- Windows-compatible

### 3. AI Processing (Ollama)
- Medical conversation logic
- Triage assessment (RED/YELLOW/GREEN)
- Response generation
- Safety protocols

### 4. Text-to-Speech (Piper)
- Windows executable (`piper.exe`)
- Fast, local TTS
- No internet required
- High-quality voice synthesis

### 5. Audio Output
- Generated speech sent back via WebSocket
- Browser plays audio response

## API Endpoints

### Health Check
```bash
GET /health
```

### Webhook (Optional)
```bash
POST /webhook/:action
```

### WebSocket
```
ws://localhost:3001
```

## WebSocket Protocol

### Client → Server
```json
{
  "type": "audio",
  "audio": "base64-encoded-wav-data"
}
```

### Server → Client
```json
{
  "type": "audio",
  "audio": "base64-encoded-response",
  "text": "spoken response text",
  "state": "TRIAGE",
  "triageLevel": "GREEN"
}
```

## Integration with Frontend

### React Component Example
```javascript
import { useEffect, useRef } from 'react';

function VoiceChat() {
  const ws = useRef(null);

  useEffect(() => {
    // Connect to voice backend
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'audio') {
        // Play audio response
        playAudio(data.audio);
      }
    };

    return () => ws.current?.close();
  }, []);

  const sendAudio = (audioBlob) => {
    // Convert to base64 and send
    const reader = new FileReader();
    reader.onload = () => {
      ws.current.send(JSON.stringify({
        type: 'audio',
        audio: reader.result.split(',')[1] // Remove data:audio/wav;base64,
      }));
    };
    reader.readAsDataURL(audioBlob);
  };

  return (
    <div>
      {/* Your voice chat UI */}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

**"Ollama not ready"**
```bash
# Check if Ollama is running
curl http://localhost:11500/api/tags

# If not running, start it
ollama serve

# Pull model
ollama pull llama2
```

**"Piper not found"**
```bash
# Check if piper.exe is in PATH
piper.exe --help

# If not found, add to PATH or place in current directory
# Download from: https://github.com/rhasspy/piper/releases
```

**"Transformers.js failed"**
```bash
# Reinstall package
npm uninstall @xenova/transformers
npm install @xenova/transformers

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port already in use**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill process (replace XXXX with PID)
taskkill /PID XXXX /F
```

### Performance Tuning

**For better performance:**
```bash
# Use smaller Whisper model (faster)
# Change in code: 'Xenova/whisper-tiny' instead of 'Xenova/whisper-small'

# Use GPU acceleration for Transformers.js (if you have CUDA)
# Set environment variable: CUDA_VISIBLE_DEVICES=0
```

## Security Considerations

### Production Deployment
- Use HTTPS (certificates)
- Implement authentication
- Rate limiting
- Input validation
- Secure WebSocket connections

### HIPAA Compliance
- Encrypt audio data in transit
- Secure storage of conversation logs
- Audit trails for all interactions
- Data retention policies

## Scaling

### Multiple Instances
- Run multiple Node.js processes
- Load balancer for WebSocket connections
- Redis for session storage
- Shared Ollama instance

### High Availability
- Process monitoring (PM2)
- Automatic restarts
- Health checks
- Backup instances

## Cost Analysis

| Component | Monthly Cost | Notes |
|-----------|-------------|--------|
| Node.js Server | $10-50 | Hosting only |
| Ollama | $0 | Local models |
| Piper | $0 | Open source |
| Transformers.js | $0 | Client-side |
| **Total** | **$10-50** | **No API fees!** |

## Support & Resources

### Documentation
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [Ollama](https://github.com/jmorganca/ollama)
- [Piper](https://github.com/rhasspy/piper)

### Community
- [ApneDoctors Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.gg/apnedoctors)

### Professional Services
- Implementation consulting
- Custom model training
- Production deployment
- HIPAA compliance audit

---

## 🎉 You're Ready!

Your Windows-native voice AI backend is now ready for ApneDoctors. The system provides:

- ✅ **Zero API costs**
- ✅ **Complete Windows compatibility**
- ✅ **Medical-grade conversation AI**
- ✅ **Emergency response protocols**
- ✅ **Production-ready architecture**

**Next:** Integrate with your React frontend and start testing voice conversations!

---

*Built with ❤️ for healthcare innovation*