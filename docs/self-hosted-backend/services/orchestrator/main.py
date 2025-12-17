"""
ApneDoctors Voice Orchestrator - Main FastAPI Application
Complete medical voice intake system with state machine conversation flow
"""

import asyncio
import json
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

import httpx
import redis.asyncio as redis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, JSON, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os

# ===========================================
# CONFIGURATION
# ===========================================

STT_URL = os.getenv("STT_URL", "http://localhost:8001")
LLM_URL = os.getenv("LLM_URL", "http://localhost:8002")
TTS_URL = os.getenv("TTS_URL", "http://localhost:8003")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://apnedoctors:changeme@localhost:5432/voice_ai")

# ===========================================
# DATABASE MODELS
# ===========================================

Base = declarative_base()

class CallSession(Base):
    __tablename__ = "call_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_name = Column(String, nullable=True)
    patient_dob = Column(String, nullable=True)
    status = Column(String, default="active")
    state = Column(String, default="greeting")
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    triage_level = Column(String, nullable=True)
    medical_data = Column(JSON, default=dict)
    transcript = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class TranscriptEntry(Base):
    __tablename__ = "transcript_entries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class MedicalExtraction(Base):
    __tablename__ = "medical_extractions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    chief_complaint = Column(Text, nullable=True)
    body_part = Column(String, nullable=True)
    severity = Column(Integer, nullable=True)
    onset_days = Column(Integer, nullable=True)
    red_flags = Column(JSON, default=dict)
    symptoms = Column(JSON, default=list)
    medications = Column(JSON, default=list)
    allergies = Column(JSON, default=list)
    triage_level = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# ===========================================
# CONVERSATION STATE MACHINE
# ===========================================

class ConversationState(str, Enum):
    GREETING = "greeting"
    CONSENT = "consent"
    IDENTIFICATION = "identification"
    CHIEF_COMPLAINT = "chief_complaint"
    SYMPTOM_PROBING = "symptom_probing"
    RED_FLAG_CHECK = "red_flag_check"
    MEDICAL_HISTORY = "medical_history"
    SUMMARIZATION = "summarization"
    TRIAGE_DECISION = "triage_decision"
    SAFE_CLOSE = "safe_close"
    URGENT_CLOSE = "urgent_close"
    ENDED = "ended"

STATE_PROMPTS = {
    ConversationState.GREETING: """You are starting a medical intake call. Introduce yourself as an AI medical intake assistant (not a doctor). 
Be warm but professional. Say: "Hello, I'm your AI medical intake assistant from ApneDoctors. I'm here to help gather information about your symptoms before you see a doctor. Please note that I am an AI assistant, not a doctor, and I cannot diagnose or prescribe medication. Is that okay to proceed?"
Keep it under 3 sentences.""",

    ConversationState.CONSENT: """The patient needs to consent to the AI-assisted intake.
If they said yes/okay/sure, acknowledge and move forward.
If unclear, ask again: "Just to confirm, do you consent to this AI-assisted medical intake?"
Keep response under 2 sentences.""",

    ConversationState.IDENTIFICATION: """Ask for the patient's name and date of birth for record purposes.
Say something like: "May I have your name and date of birth, please?"
Keep it brief and professional.""",

    ConversationState.CHIEF_COMPLAINT: """Now ask about their main concern.
Say: "What brings you in today? Please describe your main symptom or concern."
Be empathetic but focused on gathering medical information.""",

    ConversationState.SYMPTOM_PROBING: """Based on their chief complaint, ask focused follow-up questions ONE AT A TIME:
- When did this start? (onset)
- On a scale of 1-10, how severe is the pain/discomfort?
- Is it constant or does it come and go?
- What makes it better or worse?
- Does it spread to other areas?

Ask only ONE question at a time. Be concise.""",

    ConversationState.RED_FLAG_CHECK: """Screen for emergency red flags by asking:
"I need to ask some important safety questions. Have you experienced any of the following:
- Sudden severe headache?
- Chest pain or difficulty breathing?
- Numbness or weakness on one side?
- Loss of bladder or bowel control?
- High fever over 103°F/39.4°C?"

If YES to any, immediately note it as urgent.""",

    ConversationState.MEDICAL_HISTORY: """Ask about relevant medical history:
"Do you have any ongoing medical conditions, take any medications regularly, or have any allergies I should note?"
Keep it to one question, they can list multiple things.""",

    ConversationState.SUMMARIZATION: """Summarize what you've learned in 2-3 sentences.
"Let me summarize: You're experiencing [complaint] for [duration] with severity [X]/10. [Key details]. Is that correct?"
Confirm accuracy before proceeding.""",

    ConversationState.TRIAGE_DECISION: """Based on all information, determine triage level:
- RED: Emergency symptoms present, needs immediate care
- AMBER: Concerning symptoms, should see doctor within 24-48 hours  
- GREEN: Non-urgent, can schedule routine appointment

Communicate the recommendation clearly without diagnosing.""",

    ConversationState.SAFE_CLOSE: """Close the call safely:
"Thank you for sharing this information. Based on what you've told me, I recommend [timeframe]. A doctor will review this information. If your symptoms worsen, especially [relevant warning signs], please seek emergency care immediately. Take care, and feel better soon."
End warmly but professionally.""",

    ConversationState.URGENT_CLOSE: """This is an urgent situation. Say:
"Based on what you've described, I recommend you seek emergency medical care immediately. Please call emergency services or go to your nearest emergency room right away. Your safety is the priority. Do you need me to provide emergency contact numbers?"
Be calm but firm about urgency."""
}

STATE_TRANSITIONS = {
    ConversationState.GREETING: ConversationState.CONSENT,
    ConversationState.CONSENT: ConversationState.IDENTIFICATION,
    ConversationState.IDENTIFICATION: ConversationState.CHIEF_COMPLAINT,
    ConversationState.CHIEF_COMPLAINT: ConversationState.SYMPTOM_PROBING,
    ConversationState.SYMPTOM_PROBING: ConversationState.RED_FLAG_CHECK,
    ConversationState.RED_FLAG_CHECK: ConversationState.MEDICAL_HISTORY,  # or URGENT_CLOSE
    ConversationState.MEDICAL_HISTORY: ConversationState.SUMMARIZATION,
    ConversationState.SUMMARIZATION: ConversationState.TRIAGE_DECISION,
    ConversationState.TRIAGE_DECISION: ConversationState.SAFE_CLOSE,  # or URGENT_CLOSE
    ConversationState.SAFE_CLOSE: ConversationState.ENDED,
    ConversationState.URGENT_CLOSE: ConversationState.ENDED,
}

# ===========================================
# PYDANTIC MODELS
# ===========================================

class SessionStartRequest(BaseModel):
    patient_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SessionResponse(BaseModel):
    session_id: str
    status: str
    state: str
    created_at: datetime

class TranscribeRequest(BaseModel):
    session_id: str
    audio_base64: str
    sample_rate: int = 16000

class TranscribeResponse(BaseModel):
    text: str
    confidence: float
    language: str

class ChatRequest(BaseModel):
    session_id: str
    user_message: str

class ChatResponse(BaseModel):
    assistant_message: str
    state: str
    triage_level: Optional[str] = None
    medical_data: Optional[Dict[str, Any]] = None
    should_end: bool = False

class TTSRequest(BaseModel):
    text: str
    voice: str = "clinical"

class TTSResponse(BaseModel):
    audio_base64: str
    duration_ms: int

class MedicalExtractionResult(BaseModel):
    chief_complaint: Optional[str] = None
    body_part: Optional[str] = None
    severity: Optional[int] = None
    onset_days: Optional[int] = None
    red_flags: Dict[str, bool] = Field(default_factory=dict)
    symptoms: List[str] = Field(default_factory=list)
    triage_level: Optional[str] = None
    confidence_score: float = 0.0

# ===========================================
# SERVICES
# ===========================================

class STTService:
    """Speech-to-Text service client"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def transcribe(self, audio_base64: str, sample_rate: int = 16000) -> TranscribeResponse:
        response = await self.client.post(
            f"{self.base_url}/transcribe",
            json={"audio_base64": audio_base64, "sample_rate": sample_rate}
        )
        response.raise_for_status()
        data = response.json()
        return TranscribeResponse(
            text=data.get("text", ""),
            confidence=data.get("confidence", 0.0),
            language=data.get("language", "en")
        )

class LLMService:
    """LLM service client (vLLM OpenAI-compatible)"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def chat(
        self, 
        messages: List[Dict[str, str]], 
        system_prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7
    ) -> str:
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        
        response = await self.client.post(
            f"{self.base_url}/v1/chat/completions",
            json={
                "model": "meta-llama/Meta-Llama-3-8B-Instruct",
                "messages": full_messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    
    async def extract_medical_data(self, transcript: str) -> MedicalExtractionResult:
        """Extract structured medical data from conversation"""
        extraction_prompt = """You are a medical NLP system. Extract ONLY factual medical information from the transcript.
        
Return a JSON object with these fields (use null if not mentioned):
{
  "chief_complaint": "main symptom described",
  "body_part": "affected body part",
  "severity": 1-10 number or null,
  "onset_days": number of days since symptom started or null,
  "red_flags": {
    "chest_pain": true/false,
    "difficulty_breathing": true/false,
    "numbness_weakness": true/false,
    "high_fever": true/false,
    "loss_of_consciousness": true/false,
    "severe_headache": true/false
  },
  "symptoms": ["list", "of", "symptoms"],
  "triage_level": "GREEN" or "AMBER" or "RED",
  "confidence_score": 0.0-1.0
}

IMPORTANT: Do not hallucinate. Only extract what was explicitly stated.
Transcript:
"""
        
        response = await self.client.post(
            f"{self.base_url}/v1/chat/completions",
            json={
                "model": "meta-llama/Meta-Llama-3-8B-Instruct",
                "messages": [
                    {"role": "system", "content": extraction_prompt},
                    {"role": "user", "content": transcript}
                ],
                "max_tokens": 500,
                "temperature": 0.1  # Low temperature for factual extraction
            }
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        try:
            # Parse JSON from response
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                extracted = json.loads(json_match.group())
                return MedicalExtractionResult(**extracted)
        except (json.JSONDecodeError, KeyError):
            pass
        
        return MedicalExtractionResult(confidence_score=0.0)

class TTSService:
    """Text-to-Speech service client"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def synthesize(self, text: str, voice: str = "clinical") -> TTSResponse:
        response = await self.client.post(
            f"{self.base_url}/synthesize",
            json={"text": text, "voice": voice}
        )
        response.raise_for_status()
        data = response.json()
        return TTSResponse(
            audio_base64=data.get("audio_base64", ""),
            duration_ms=data.get("duration_ms", 0)
        )

# ===========================================
# CONVERSATION MANAGER
# ===========================================

class ConversationManager:
    """Manages conversation state and flow"""
    
    def __init__(self, redis_client: redis.Redis, llm_service: LLMService):
        self.redis = redis_client
        self.llm = llm_service
    
    async def get_session_state(self, session_id: str) -> Dict[str, Any]:
        """Get current session state from Redis"""
        data = await self.redis.get(f"session:{session_id}")
        if data:
            return json.loads(data)
        return {
            "state": ConversationState.GREETING.value,
            "messages": [],
            "medical_data": {},
            "red_flags_detected": False
        }
    
    async def save_session_state(self, session_id: str, state: Dict[str, Any]):
        """Save session state to Redis"""
        await self.redis.set(
            f"session:{session_id}",
            json.dumps(state),
            ex=3600  # 1 hour expiry
        )
    
    def should_advance_state(self, current_state: ConversationState, user_message: str, medical_data: Dict) -> bool:
        """Determine if conversation should advance to next state"""
        user_lower = user_message.lower().strip()
        
        # State-specific transition logic
        if current_state == ConversationState.GREETING:
            return True  # Always advance after greeting
        
        if current_state == ConversationState.CONSENT:
            return any(word in user_lower for word in ["yes", "okay", "sure", "fine", "agree", "proceed"])
        
        if current_state == ConversationState.IDENTIFICATION:
            # Check if name was provided (any substantial response)
            return len(user_message.split()) >= 2
        
        if current_state == ConversationState.CHIEF_COMPLAINT:
            # Advance if complaint was described
            return len(user_message) > 10
        
        if current_state == ConversationState.SYMPTOM_PROBING:
            # Stay in probing if we don't have enough data
            has_severity = medical_data.get("severity") is not None
            has_onset = medical_data.get("onset_days") is not None
            return has_severity and has_onset
        
        if current_state == ConversationState.RED_FLAG_CHECK:
            return True  # Always advance after red flag check
        
        if current_state == ConversationState.MEDICAL_HISTORY:
            return True  # Advance after any response
        
        if current_state == ConversationState.SUMMARIZATION:
            # Advance if confirmed
            return any(word in user_lower for word in ["yes", "correct", "right", "accurate"])
        
        if current_state == ConversationState.TRIAGE_DECISION:
            return True
        
        return True
    
    def get_next_state(self, current_state: ConversationState, red_flags_detected: bool) -> ConversationState:
        """Get next state based on current state and flags"""
        if red_flags_detected and current_state in [
            ConversationState.RED_FLAG_CHECK,
            ConversationState.TRIAGE_DECISION
        ]:
            return ConversationState.URGENT_CLOSE
        
        return STATE_TRANSITIONS.get(current_state, ConversationState.ENDED)
    
    async def process_message(self, session_id: str, user_message: str) -> ChatResponse:
        """Process user message and generate response"""
        session_state = await self.get_session_state(session_id)
        current_state = ConversationState(session_state["state"])
        messages = session_state.get("messages", [])
        medical_data = session_state.get("medical_data", {})
        red_flags_detected = session_state.get("red_flags_detected", False)
        
        # Add user message to history
        messages.append({"role": "user", "content": user_message})
        
        # Extract medical data from the conversation so far
        full_transcript = " ".join([m["content"] for m in messages if m["role"] == "user"])
        extraction = await self.llm.extract_medical_data(full_transcript)
        
        # Update medical data
        if extraction.chief_complaint:
            medical_data["chief_complaint"] = extraction.chief_complaint
        if extraction.severity:
            medical_data["severity"] = extraction.severity
        if extraction.onset_days:
            medical_data["onset_days"] = extraction.onset_days
        if extraction.symptoms:
            medical_data["symptoms"] = extraction.symptoms
        
        # Check for red flags
        if extraction.red_flags:
            if any(extraction.red_flags.values()):
                red_flags_detected = True
                medical_data["red_flags"] = extraction.red_flags
        
        # Determine if state should advance
        if self.should_advance_state(current_state, user_message, medical_data):
            current_state = self.get_next_state(current_state, red_flags_detected)
        
        # Generate AI response
        system_prompt = STATE_PROMPTS.get(current_state, STATE_PROMPTS[ConversationState.SAFE_CLOSE])
        
        # Add medical context to system prompt
        if medical_data:
            system_prompt += f"\n\nPatient information gathered so far: {json.dumps(medical_data, indent=2)}"
        
        ai_response = await self.llm.chat(
            messages=messages[-6:],  # Keep last 6 messages for context
            system_prompt=system_prompt,
            max_tokens=300,
            temperature=0.7
        )
        
        # Add AI response to history
        messages.append({"role": "assistant", "content": ai_response})
        
        # Determine triage level
        triage_level = None
        if current_state in [ConversationState.TRIAGE_DECISION, ConversationState.SAFE_CLOSE, ConversationState.URGENT_CLOSE]:
            if red_flags_detected:
                triage_level = "RED"
            elif extraction.triage_level:
                triage_level = extraction.triage_level
            else:
                # Default based on severity
                severity = medical_data.get("severity", 5)
                if severity >= 8:
                    triage_level = "AMBER"
                else:
                    triage_level = "GREEN"
        
        # Save updated state
        session_state["state"] = current_state.value
        session_state["messages"] = messages
        session_state["medical_data"] = medical_data
        session_state["red_flags_detected"] = red_flags_detected
        await self.save_session_state(session_id, session_state)
        
        return ChatResponse(
            assistant_message=ai_response,
            state=current_state.value,
            triage_level=triage_level,
            medical_data=medical_data,
            should_end=current_state in [ConversationState.ENDED, ConversationState.SAFE_CLOSE, ConversationState.URGENT_CLOSE]
        )

# ===========================================
# FASTAPI APPLICATION
# ===========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.redis = redis.from_url(REDIS_URL)
    app.state.stt = STTService(STT_URL)
    app.state.llm = LLMService(LLM_URL)
    app.state.tts = TTSService(TTS_URL)
    app.state.conversation_manager = ConversationManager(app.state.redis, app.state.llm)
    yield
    # Shutdown
    await app.state.redis.close()

app = FastAPI(
    title="ApneDoctors Voice AI",
    description="Self-hosted medical voice intake and triage system",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================================
# API ENDPOINTS
# ===========================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/v1/session/start", response_model=SessionResponse)
async def start_session(request: SessionStartRequest):
    """Start a new voice call session"""
    session_id = str(uuid.uuid4())
    
    # Initialize session state in Redis
    initial_state = {
        "state": ConversationState.GREETING.value,
        "messages": [],
        "medical_data": {},
        "red_flags_detected": False,
        "started_at": datetime.utcnow().isoformat()
    }
    await app.state.redis.set(
        f"session:{session_id}",
        json.dumps(initial_state),
        ex=3600
    )
    
    return SessionResponse(
        session_id=session_id,
        status="active",
        state=ConversationState.GREETING.value,
        created_at=datetime.utcnow()
    )

@app.post("/api/v1/session/{session_id}/end")
async def end_session(session_id: str):
    """End a voice call session"""
    session_state = await app.state.conversation_manager.get_session_state(session_id)
    
    # Mark as ended
    session_state["state"] = ConversationState.ENDED.value
    session_state["ended_at"] = datetime.utcnow().isoformat()
    
    await app.state.redis.set(
        f"session:{session_id}:final",
        json.dumps(session_state),
        ex=86400  # Keep for 24 hours
    )
    await app.state.redis.delete(f"session:{session_id}")
    
    return {
        "session_id": session_id,
        "status": "ended",
        "medical_data": session_state.get("medical_data", {}),
        "triage_level": session_state.get("triage_level")
    }

@app.post("/api/v1/stt/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(request: TranscribeRequest):
    """Transcribe audio to text"""
    return await app.state.stt.transcribe(
        audio_base64=request.audio_base64,
        sample_rate=request.sample_rate
    )

@app.post("/api/v1/llm/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process user message and get AI response"""
    return await app.state.conversation_manager.process_message(
        session_id=request.session_id,
        user_message=request.user_message
    )

@app.post("/api/v1/tts/synthesize", response_model=TTSResponse)
async def synthesize_speech(request: TTSRequest):
    """Convert text to speech"""
    return await app.state.tts.synthesize(
        text=request.text,
        voice=request.voice
    )

@app.post("/api/v1/medical/extract")
async def extract_medical_data(session_id: str):
    """Extract structured medical data from session"""
    session_state = await app.state.conversation_manager.get_session_state(session_id)
    messages = session_state.get("messages", [])
    
    full_transcript = " ".join([m["content"] for m in messages])
    extraction = await app.state.llm.extract_medical_data(full_transcript)
    
    return {
        "session_id": session_id,
        "extraction": extraction.dict(),
        "transcript_length": len(full_transcript)
    }

@app.get("/api/v1/session/{session_id}/state")
async def get_session_state(session_id: str):
    """Get current session state"""
    state = await app.state.conversation_manager.get_session_state(session_id)
    return {
        "session_id": session_id,
        "state": state
    }

# ===========================================
# WEBSOCKET FOR REAL-TIME VOICE
# ===========================================

@app.websocket("/ws/voice/{session_id}")
async def websocket_voice(websocket: WebSocket, session_id: str):
    """Real-time voice WebSocket endpoint"""
    await websocket.accept()
    
    try:
        while True:
            # Receive audio chunk
            data = await websocket.receive_json()
            
            if data.get("type") == "audio":
                # Transcribe
                transcription = await app.state.stt.transcribe(
                    audio_base64=data["audio"],
                    sample_rate=data.get("sample_rate", 16000)
                )
                
                if transcription.text.strip():
                    # Process with LLM
                    response = await app.state.conversation_manager.process_message(
                        session_id=session_id,
                        user_message=transcription.text
                    )
                    
                    # Synthesize response
                    tts_response = await app.state.tts.synthesize(
                        text=response.assistant_message
                    )
                    
                    # Send response
                    await websocket.send_json({
                        "type": "response",
                        "transcription": transcription.text,
                        "response_text": response.assistant_message,
                        "response_audio": tts_response.audio_base64,
                        "state": response.state,
                        "triage_level": response.triage_level,
                        "should_end": response.should_end
                    })
            
            elif data.get("type") == "end":
                break
    
    except WebSocketDisconnect:
        pass
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
