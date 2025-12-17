"""
Coqui XTTS v2 TTS Service
Self-hosted text-to-speech with natural voice synthesis
"""

import base64
import io
import os
from typing import Optional

import numpy as np
import scipy.io.wavfile as wavfile
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from TTS.api import TTS

# Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "tts_models/multilingual/multi-dataset/xtts_v2")
DEVICE = os.getenv("DEVICE", "cuda")

app = FastAPI(title="ApneDoctors TTS Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TTS model
tts_model: Optional[TTS] = None

# Pre-defined speaker embedding for clinical voice
CLINICAL_SPEAKER_WAV = None  # Can be set to a reference audio file path

@app.on_event("startup")
async def load_model():
    global tts_model
    print(f"Loading TTS model: {MODEL_NAME}")
    tts_model = TTS(MODEL_NAME).to(DEVICE)
    print("TTS model loaded successfully")

class SynthesizeRequest(BaseModel):
    text: str
    voice: str = "clinical"
    language: str = "en"
    speed: float = 1.0

class SynthesizeResponse(BaseModel):
    audio_base64: str
    duration_ms: int
    sample_rate: int

@app.get("/health")
async def health():
    return {"status": "healthy", "model": MODEL_NAME, "device": DEVICE}

@app.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize(request: SynthesizeRequest):
    """Synthesize speech from text"""
    if tts_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Clean and prepare text
        text = request.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail="Empty text")
        
        # Limit text length for safety
        if len(text) > 1000:
            text = text[:1000]
        
        # Generate audio
        # XTTS v2 requires a speaker reference or uses default
        wav = tts_model.tts(
            text=text,
            language=request.language,
            speaker_wav=CLINICAL_SPEAKER_WAV,  # None uses default voice
            speed=request.speed
        )
        
        # Convert to numpy array
        wav_array = np.array(wav, dtype=np.float32)
        
        # Normalize audio
        max_val = np.abs(wav_array).max()
        if max_val > 0:
            wav_array = wav_array / max_val * 0.95
        
        # Convert to 16-bit PCM
        wav_int16 = (wav_array * 32767).astype(np.int16)
        
        # Write to WAV buffer
        buffer = io.BytesIO()
        sample_rate = 24000  # XTTS default sample rate
        wavfile.write(buffer, sample_rate, wav_int16)
        
        # Get audio bytes and encode
        audio_bytes = buffer.getvalue()
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Calculate duration
        duration_ms = int(len(wav_array) / sample_rate * 1000)
        
        return SynthesizeResponse(
            audio_base64=audio_base64,
            duration_ms=duration_ms,
            sample_rate=sample_rate
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")

@app.post("/synthesize/stream")
async def synthesize_stream(request: SynthesizeRequest):
    """Streaming synthesis for real-time audio output"""
    # For now, same as regular synthesis
    # Could be enhanced with chunked streaming
    return await synthesize(request)

@app.get("/voices")
async def list_voices():
    """List available voices"""
    return {
        "voices": [
            {"id": "clinical", "name": "Clinical Voice", "description": "Calm, professional medical voice"},
            {"id": "friendly", "name": "Friendly Voice", "description": "Warm, approachable voice"},
        ],
        "languages": ["en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh", "ja", "ko"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
