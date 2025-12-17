/**
 * ExternalVoiceService - Integration layer for self-hosted voice AI backend
 * Connects Lovable frontend to your GPU server running the voice pipeline
 */

export interface VoiceSession {
  sessionId: string;
  status: 'active' | 'ended';
  state: string;
  createdAt: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

export interface ChatResponse {
  assistantMessage: string;
  state: string;
  triageLevel: 'GREEN' | 'AMBER' | 'RED' | null;
  medicalData: Record<string, any>;
  shouldEnd: boolean;
}

export interface TTSResult {
  audioBase64: string;
  durationMs: number;
}

export interface MedicalExtraction {
  chiefComplaint: string | null;
  bodyPart: string | null;
  severity: number | null;
  onsetDays: number | null;
  redFlags: Record<string, boolean>;
  symptoms: string[];
  triageLevel: string | null;
  confidenceScore: number;
}

export interface WebSocketMessage {
  type: 'response' | 'error' | 'state_update';
  transcription?: string;
  responseText?: string;
  responseAudio?: string;
  state?: string;
  triageLevel?: string;
  shouldEnd?: boolean;
  error?: string;
}

export class ExternalVoiceService {
  private baseUrl: string;
  private websocket: WebSocket | null = null;
  private sessionId: string | null = null;

  constructor(baseUrl: string) {
    // Remove trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Check if backend is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      console.error('Voice backend health check failed:', error);
      return false;
    }
  }

  /**
   * Start a new voice session
   */
  async startSession(metadata?: Record<string, any>): Promise<VoiceSession> {
    const response = await fetch(`${this.baseUrl}/api/v1/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start session: ${response.statusText}`);
    }

    const data = await response.json();
    this.sessionId = data.session_id;
    
    return {
      sessionId: data.session_id,
      status: data.status,
      state: data.state,
      createdAt: data.created_at,
    };
  }

  /**
   * End current session
   */
  async endSession(): Promise<{ medicalData: Record<string, any>; triageLevel: string | null }> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/session/${this.sessionId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to end session: ${response.statusText}`);
    }

    const data = await response.json();
    this.sessionId = null;
    
    return {
      medicalData: data.medical_data,
      triageLevel: data.triage_level,
    };
  }

  /**
   * Transcribe audio chunk
   */
  async transcribe(audioBase64: string, sampleRate: number = 16000): Promise<TranscriptionResult> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/stt/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.sessionId,
        audio_base64: audioBase64,
        sample_rate: sampleRate,
      }),
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.text,
      confidence: data.confidence,
      language: data.language,
    };
  }

  /**
   * Send message to AI and get response
   */
  async chat(userMessage: string): Promise<ChatResponse> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/llm/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.sessionId,
        user_message: userMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      assistantMessage: data.assistant_message,
      state: data.state,
      triageLevel: data.triage_level,
      medicalData: data.medical_data || {},
      shouldEnd: data.should_end,
    };
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(text: string, voice: string = 'clinical'): Promise<TTSResult> {
    const response = await fetch(`${this.baseUrl}/api/v1/tts/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      audioBase64: data.audio_base64,
      durationMs: data.duration_ms,
    };
  }

  /**
   * Extract medical data from session
   */
  async extractMedicalData(): Promise<MedicalExtraction> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/api/v1/medical/extract?session_id=${this.sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    const extraction = data.extraction;
    
    return {
      chiefComplaint: extraction.chief_complaint,
      bodyPart: extraction.body_part,
      severity: extraction.severity,
      onsetDays: extraction.onset_days,
      redFlags: extraction.red_flags || {},
      symptoms: extraction.symptoms || [],
      triageLevel: extraction.triage_level,
      confidenceScore: extraction.confidence_score,
    };
  }

  /**
   * Connect WebSocket for real-time voice
   */
  connectWebSocket(
    onMessage: (message: WebSocketMessage) => void,
    onError: (error: Event) => void,
    onClose: () => void
  ): void {
    if (!this.sessionId) {
      throw new Error('No active session - start session first');
    }

    const wsUrl = this.baseUrl.replace('http', 'ws');
    this.websocket = new WebSocket(`${wsUrl}/ws/voice/${this.sessionId}`);

    this.websocket.onopen = () => {
      console.log('Voice WebSocket connected');
    };

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    this.websocket.onerror = onError;
    this.websocket.onclose = onClose;
  }

  /**
   * Send audio chunk via WebSocket
   */
  sendAudioChunk(audioBase64: string, sampleRate: number = 16000): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.websocket.send(JSON.stringify({
      type: 'audio',
      audio: audioBase64,
      sample_rate: sampleRate,
    }));
  }

  /**
   * Close WebSocket connection
   */
  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.send(JSON.stringify({ type: 'end' }));
      this.websocket.close();
      this.websocket = null;
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
  }
}

/**
 * Audio utilities for recording and encoding
 */
export class AudioUtils {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;

  /**
   * Start recording from microphone
   */
  async startRecording(onAudioChunk: (base64: string) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(this.stream);
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const base64 = this.float32ToBase64(inputData);
      onAudioChunk(base64);
    };

    source.connect(processor);
    processor.connect(this.audioContext.destination);
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Convert Float32Array to base64 PCM
   */
  private float32ToBase64(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Play base64 audio
   */
  async playAudio(base64Audio: string): Promise<void> {
    const audioData = atob(base64Audio);
    const audioArray = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      audioArray[i] = audioData.charCodeAt(i);
    }

    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(audioArray.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  }
}
