# ApneDoctors Voice AI - Self-Hosted Architecture

## Overview

A complete self-hosted voice AI system for medical intake and triage, comparable to Bolna AI, using only open-source models.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APNEDOCTORS VOICE AI                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Browser   │◄──►│   WebRTC    │◄──►│   Voice     │◄──►│   Medical   │  │
│  │   Client    │    │   Server    │    │   Pipeline  │    │   NLP       │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        AI INFERENCE LAYER                           │   │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐  │   │
│  │  │  Whisper  │    │  LLaMA 3  │    │   Coqui   │    │  Medical  │  │   │
│  │  │   STT     │    │    LLM    │    │   XTTS    │    │    RAG    │  │   │
│  │  │  (CUDA)   │    │  (vLLM)   │    │  (CUDA)   │    │ (Qdrant)  │  │   │
│  │  └───────────┘    └───────────┘    └───────────┘    └───────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                   │   │
│  │  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐       │   │
│  │  │  PostgreSQL   │    │     Redis     │    │    Qdrant     │       │   │
│  │  │  (Sessions)   │    │   (Realtime)  │    │   (Vectors)   │       │   │
│  │  └───────────────┘    └───────────────┘    └───────────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Hardware Requirements

### Minimum (Development)
- **GPU**: NVIDIA RTX 3080 (10GB VRAM) or better
- **RAM**: 32GB
- **Storage**: 100GB SSD
- **CPU**: 8 cores

### Recommended (Production)
- **GPU**: NVIDIA A100 (40GB) or RTX 4090 (24GB)
- **RAM**: 64GB
- **Storage**: 500GB NVMe SSD
- **CPU**: 16+ cores

### Cloud Options
- **AWS**: g4dn.xlarge ($0.52/hr) or g5.xlarge ($1.01/hr)
- **GCP**: n1-standard-8 + T4 GPU (~$0.35/hr)
- **Lambda Labs**: A10 instance (~$0.60/hr)

## Components

### 1. Speech-to-Text (STT)
- **Model**: Faster-Whisper (large-v3)
- **Latency**: <300ms for 5s audio
- **Languages**: 99+ supported

### 2. Large Language Model (LLM)
- **Model**: LLaMA 3 8B Instruct (or Mistral 7B)
- **Serving**: vLLM for high throughput
- **Context**: 8K tokens

### 3. Text-to-Speech (TTS)
- **Model**: Coqui XTTS v2
- **Voice**: Natural, clinical tone
- **Streaming**: Real-time audio output

### 4. Medical NLP
- **Extraction**: Structured medical data
- **Red Flags**: Emergency detection
- **Triage**: GREEN/AMBER/RED classification

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/session/start` | POST | Start new call session |
| `/api/v1/session/{id}/end` | POST | End call session |
| `/api/v1/stt/transcribe` | POST | Transcribe audio chunk |
| `/api/v1/llm/chat` | POST | Get LLM response |
| `/api/v1/tts/synthesize` | POST | Generate speech |
| `/api/v1/medical/extract` | POST | Extract medical data |
| `/api/v1/triage/assess` | POST | Get triage level |
| `/ws/voice` | WebSocket | Real-time voice stream |

## Conversation Flow State Machine

```
START
  │
  ▼
┌─────────────────┐
│    GREETING     │ "Hello, I'm your AI medical assistant..."
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    CONSENT      │ "Do you consent to this AI-assisted intake?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IDENTIFICATION │ "May I have your name and date of birth?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CHIEF COMPLAINT │ "What brings you in today?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SYMPTOM PROBING │ "When did this start? Scale 1-10?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RED FLAG CHECK │ "Any numbness, weakness, fever?"
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
RED FLAG    NO FLAGS
    │         │
    ▼         ▼
┌───────┐ ┌─────────────────┐
│URGENT │ │ MEDICAL HISTORY │
│CLOSE  │ └────────┬────────┘
└───────┘          │
                   ▼
         ┌─────────────────┐
         │  SUMMARIZATION  │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ TRIAGE DECISION │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   SAFE CLOSE    │ "Please seek care within..."
         └─────────────────┘
                  │
                  ▼
                 END
```

## Structured Output Schema

```json
{
  "session_id": "uuid",
  "patient": {
    "name": "string",
    "dob": "date",
    "contact": "string"
  },
  "medical_data": {
    "chief_complaint": "string",
    "body_part": "string",
    "onset_days": "number",
    "duration": "string",
    "severity_scale_0_10": "number",
    "pain_character": "string",
    "radiation": "string",
    "associated_symptoms": ["string"],
    "aggravating_factors": ["string"],
    "relieving_factors": ["string"]
  },
  "red_flags": {
    "numbness": "boolean",
    "weakness": "boolean",
    "loss_of_bladder_control": "boolean",
    "major_trauma": "boolean",
    "high_fever": "boolean",
    "chest_pain": "boolean",
    "shortness_of_breath": "boolean",
    "sudden_severe_headache": "boolean"
  },
  "history": {
    "past_conditions": ["string"],
    "current_medications": ["string"],
    "allergies": ["string"],
    "surgeries": ["string"]
  },
  "triage": {
    "level": "GREEN | AMBER | RED",
    "urgency": "string",
    "recommended_timeframe": "string",
    "confidence_score": "number"
  },
  "summary": {
    "chief_complaint_summary": "string",
    "clinical_impression": "string",
    "doctor_notes": "string"
  },
  "metadata": {
    "call_duration_seconds": "number",
    "transcript_word_count": "number",
    "ai_confidence": "number",
    "created_at": "timestamp"
  }
}
```

## Safety Requirements

### Mandatory Disclaimers
1. **Opening**: "I am an AI medical intake assistant, not a doctor."
2. **Throughout**: Never diagnose or prescribe
3. **Closing**: "If symptoms worsen, seek emergency care immediately."

### Red Flag Escalation
When detected, immediately:
1. Acknowledge the severity
2. Recommend emergency care
3. Provide emergency numbers
4. End call with safety instructions

## Deployment Options

### Option A: Single Server (Development)
All services on one GPU machine

### Option B: Distributed (Production)
- Load balancer → Multiple API servers
- Dedicated GPU nodes for inference
- Managed PostgreSQL
- Redis cluster

See `docker-compose.yml` for complete setup.
