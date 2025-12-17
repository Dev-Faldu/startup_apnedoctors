"""
Faster-Whisper STT Service
Self-hosted speech-to-text using Faster-Whisper with CUDA acceleration
"""

import base64
import io
import os
from typing import Optional

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from pydantic import BaseModel

# Configuration
MODEL_SIZE = os.getenv("MODEL_SIZE", "large-v3")
DEVICE = os.getenv("DEVICE", "cuda")
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", "float16")

app = FastAPI(title="ApneDoctors STT Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
model: Optional[WhisperModel] = None

@app.on_event("startup")
async def load_model():
    global model
    print(f"Loading Whisper model: {MODEL_SIZE} on {DEVICE}")
    model = WhisperModel(
        MODEL_SIZE,
        device=DEVICE,
        compute_type=COMPUTE_TYPE
    )
    print("Model loaded successfully")

class TranscribeRequest(BaseModel):
    audio_base64: str
    sample_rate: int = 16000
    language: Optional[str] = None

class TranscribeResponse(BaseModel):
    text: str
    confidence: float
    language: str
    segments: list

@app.get("/health")
async def health():
    return {"status": "healthy", "model": MODEL_SIZE, "device": DEVICE}

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(request: TranscribeRequest):
    """Transcribe audio from base64 encoded data"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(request.audio_base64)
        
        # Convert to numpy array
        audio_buffer = io.BytesIO(audio_bytes)
        
        try:
            # Try to read as WAV/FLAC/etc
            audio_data, sample_rate = sf.read(audio_buffer)
        except:
            # Assume raw PCM 16-bit
            audio_data = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            sample_rate = request.sample_rate
        
        # Ensure mono
        if len(audio_data.shape) > 1:
            audio_data = audio_data.mean(axis=1)
        
        # Resample to 16kHz if needed (Whisper expects 16kHz)
        if sample_rate != 16000:
            import scipy.signal
            audio_data = scipy.signal.resample(
                audio_data, 
                int(len(audio_data) * 16000 / sample_rate)
            )
        
        # Transcribe
        segments, info = model.transcribe(
            audio_data,
            language=request.language,
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=500,
                speech_pad_ms=400
            )
        )
        
        # Collect results
        text_parts = []
        segment_list = []
        total_confidence = 0
        segment_count = 0
        
        for segment in segments:
            text_parts.append(segment.text)
            segment_list.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
                "confidence": segment.avg_logprob
            })
            total_confidence += segment.avg_logprob
            segment_count += 1
        
        full_text = " ".join(text_parts).strip()
        avg_confidence = total_confidence / max(segment_count, 1)
        
        # Convert log probability to 0-1 confidence
        confidence = min(1.0, max(0.0, (avg_confidence + 1) / 1))
        
        return TranscribeResponse(
            text=full_text,
            confidence=confidence,
            language=info.language if info else "en",
            segments=segment_list
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/transcribe/stream")
async def transcribe_stream(request: TranscribeRequest):
    """Streaming transcription for real-time audio"""
    # Same as regular transcribe but optimized for chunks
    return await transcribe(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
