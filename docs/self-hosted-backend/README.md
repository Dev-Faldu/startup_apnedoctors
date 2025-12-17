# ApneDoctors Voice AI - Self-Hosted Backend

Complete self-hosted voice AI system for medical intake and triage.

## Quick Start

### Prerequisites

1. **NVIDIA GPU** with CUDA support (RTX 3080+ recommended)
2. **Docker** with NVIDIA Container Toolkit
3. **32GB+ RAM**
4. **HuggingFace Token** (for LLaMA model access)

### Installation

```bash
# 1. Clone and navigate
cd self-hosted-backend

# 2. Set environment variables
cp .env.example .env
# Edit .env with your HF_TOKEN

# 3. Start services
docker-compose up -d

# 4. Check health
curl http://localhost:8000/health
```

### Environment Variables

```bash
# .env file
HF_TOKEN=your_huggingface_token
POSTGRES_PASSWORD=secure_password_here
GRAFANA_PASSWORD=admin_password
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                        │
│                   (nginx/traefik)                       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                  VOICE ORCHESTRATOR                      │
│                   (FastAPI :8000)                        │
│  - Session management                                    │
│  - Conversation state machine                            │
│  - Medical NLP extraction                                │
└───────┬─────────────────┬─────────────────┬─────────────┘
        │                 │                 │
┌───────┴───────┐ ┌───────┴───────┐ ┌───────┴───────┐
│  WHISPER STT  │ │   vLLM LLM    │ │  COQUI TTS    │
│    (:8001)    │ │    (:8002)    │ │    (:8003)    │
│  GPU: 2-4GB   │ │  GPU: 8-16GB  │ │  GPU: 2-4GB   │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
┌───────┴─────────────────┴─────────────────┴─────────────┐
│                    DATA LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Postgres │  │  Redis   │  │  Qdrant  │               │
│  │  (data)  │  │ (session)│  │ (vectors)│               │
│  └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

## API Reference

### Session Management

```bash
# Start session
POST /api/v1/session/start
Response: { "session_id": "uuid", "status": "active", "state": "greeting" }

# End session
POST /api/v1/session/{session_id}/end
Response: { "session_id": "uuid", "medical_data": {...}, "triage_level": "GREEN" }

# Get session state
GET /api/v1/session/{session_id}/state
```

### Voice Pipeline

```bash
# Transcribe audio
POST /api/v1/stt/transcribe
Body: { "audio_base64": "...", "sample_rate": 16000 }
Response: { "text": "...", "confidence": 0.95, "language": "en" }

# Chat with AI
POST /api/v1/llm/chat
Body: { "session_id": "uuid", "user_message": "I have back pain" }
Response: { "assistant_message": "...", "state": "symptom_probing", "triage_level": null }

# Synthesize speech
POST /api/v1/tts/synthesize
Body: { "text": "Hello, how can I help?", "voice": "clinical" }
Response: { "audio_base64": "...", "duration_ms": 2500 }
```

### WebSocket Real-Time

```javascript
// Connect
const ws = new WebSocket('ws://localhost:8000/ws/voice/{session_id}');

// Send audio
ws.send(JSON.stringify({
  type: 'audio',
  audio: base64AudioChunk,
  sample_rate: 16000
}));

// Receive response
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.transcription - what user said
  // data.response_text - AI response text
  // data.response_audio - AI response audio (base64)
  // data.state - current conversation state
  // data.triage_level - current triage assessment
};
```

## Conversation Flow

1. **GREETING** → AI introduces itself as medical assistant
2. **CONSENT** → Gets patient consent for AI intake
3. **IDENTIFICATION** → Collects name and DOB
4. **CHIEF_COMPLAINT** → "What brings you in today?"
5. **SYMPTOM_PROBING** → Severity, onset, character questions
6. **RED_FLAG_CHECK** → Screen for emergency symptoms
7. **MEDICAL_HISTORY** → Medications, allergies, conditions
8. **SUMMARIZATION** → Confirm understanding
9. **TRIAGE_DECISION** → GREEN/AMBER/RED classification
10. **SAFE_CLOSE** / **URGENT_CLOSE** → Appropriate closing

## GPU Memory Requirements

| Service | Min VRAM | Recommended |
|---------|----------|-------------|
| Whisper large-v3 | 4GB | 6GB |
| LLaMA 3 8B | 8GB | 12GB |
| XTTS v2 | 2GB | 4GB |
| **Total** | **14GB** | **22GB** |

For single GPU: Use RTX 4090 (24GB) or A100 (40GB)
For multi-GPU: Distribute services across GPUs

## Production Deployment

### Single Server
```bash
docker-compose up -d
```

### Kubernetes
See `k8s/` directory for Helm charts.

### Cloud Deployment

**AWS:**
```bash
# Launch g5.2xlarge (1x A10G 24GB)
aws ec2 run-instances --instance-type g5.2xlarge ...
```

**GCP:**
```bash
# Create VM with T4 GPU
gcloud compute instances create voice-ai --accelerator type=nvidia-tesla-t4,count=1 ...
```

## Connecting to Lovable Frontend

Set your backend URL in Lovable:

```typescript
// In Lovable project
const VOICE_BACKEND_URL = 'https://your-voice-backend.com';

// Use ExternalVoiceService
import { ExternalVoiceService } from '@/services/ExternalVoiceService';
const voiceService = new ExternalVoiceService(VOICE_BACKEND_URL);
```

## Monitoring

Enable monitoring stack:
```bash
docker-compose --profile monitoring up -d
```

Access:
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

## Security Notes

1. **Always use HTTPS** in production
2. **Rotate HF_TOKEN** regularly
3. **Implement rate limiting** for API endpoints
4. **Audit all calls** for compliance
5. **Never store raw audio** longer than necessary

## Troubleshooting

### "CUDA out of memory"
Reduce model sizes or use model quantization:
```bash
# In docker-compose.yml, change vLLM command:
--dtype int8  # Use INT8 quantization
```

### "Model loading slow"
Models are cached after first load. Warm up on startup:
```bash
curl http://localhost:8001/health  # Triggers model load
curl http://localhost:8002/health
curl http://localhost:8003/health
```

### "WebSocket disconnects"
Check Redis connection and increase timeout:
```bash
# In orchestrator, set longer timeout
REDIS_SOCKET_TIMEOUT=30
```
