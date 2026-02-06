/**
 * ApneDoctors Voice AI Backend - FULLY OPEN SOURCE VERSION
 * 
 * 🆓 100% FREE - NO API COSTS
 * Uses: Whisper (STT) + Llama 3 (LLM) + Coqui TTS (TTS)
 * 
 * Monthly cost: $0 (only server hosting ~$10-50/month)
 */

const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  PORT: process.env.PORT || 3001,
  
  // Local AI Services (all self-hosted)
  WHISPER_API: process.env.WHISPER_API || 'http://localhost:9000',  // faster-whisper server
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11500', // Ollama (Llama 3)
  COQUI_TTS_API: process.env.COQUI_TTS_API || 'http://localhost:5002', // Coqui TTS

  // Or use Transformers.js (runs in Node.js, no separate server needed)
  USE_TRANSFORMERS_JS: process.env.USE_TRANSFORMERS_JS === 'true',
  
  // Telephony
  FONOSTER_API_URL: process.env.FONOSTER_API_URL || 'http://localhost:50051',
  
  // n8n Integration
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  
  // Voice Settings
  TTS_SPEAKER: 'ljspeech',  // Free voice
  TTS_LANGUAGE: 'en',
  
  // Safety
  MAX_CALL_DURATION: 30 * 60 * 1000,
};

// =============================================================================
// MASTER OPERATING PROMPT (SAME AS BEFORE - MEDICAL SAFETY FIRST)
// =============================================================================

const MASTER_PROMPT = `You are APNE, the official medical voice intelligence of ApneDoctors.

🧠 IDENTITY
You are NOT a chatbot or assistant. You are a calm, precise, safety-first medical conversation agent.

🩺 CORE MISSION
1. Understand the caller's intent and condition
2. Collect medically relevant information
3. Assess urgency (RED/YELLOW/GREEN triage)
4. Take the correct action
5. Protect patient safety
6. Escalate to humans when required

You NEVER:
- Diagnose diseases
- Prescribe medication
- Guess medical facts
- Argue with the caller
- Downplay danger

🚨 TRIAGE CLASSIFICATION
- RED → Immediate danger (chest pain, breathing difficulty, severe bleeding, unconsciousness)
- YELLOW → Needs doctor attention soon
- GREEN → Non-urgent

🚨 RED TRIAGE BEHAVIOR (LOCKDOWN MODE)
If RED is detected:
1. STOP exploratory conversation
2. Say: "I'm concerned about what you're describing. Please stay with me. I'm arranging immediate medical help for you."
3. Trigger emergency workflow
4. Keep caller engaged calmly

🧬 STYLE GUIDELINES
- Speak like a private hospital concierge
- Warm, grounded, confident
- Less words > more words
- Calm beats clever

🔐 SAFETY RULE
Patient safety > User satisfaction > Completion. Always.

RESPONSE FORMAT (JSON):
{
  "state": "GREETING|CONSENT|SYMPTOM_COLLECTION|TRIAGE|ACTION|HANDOFF|CLOSING",
  "message": "what to say to caller",
  "action": "trigger_emergency_workflow|schedule_appointment|handoff_human|null",
  "triage_level": "RED|YELLOW|GREEN|UNKNOWN",
  "escalate": boolean
}`;

// =============================================================================
// OPEN SOURCE AI SERVICES
// =============================================================================

class OpenSourceVoiceAI {
  constructor() {
    this.whisperReady = false;
    this.ollamaReady = false;
    this.ttsReady = false;
    this.initializeServices();
  }

  async initializeServices() {
    console.log('🔧 Initializing open-source AI services...');
    
    // Check Whisper
    try {
      await axios.get(`${CONFIG.WHISPER_API}/health`);
      this.whisperReady = true;
      console.log('✅ Whisper (STT) ready');
    } catch (error) {
      console.log('⚠️  Whisper not ready. Start with: python whisper_server.py');
    }

    // Check Ollama (Llama 3)
    try {
      await axios.get(`${CONFIG.OLLAMA_API}/api/tags`);
      this.ollamaReady = true;
      console.log('✅ Ollama (Llama 3) ready');
    } catch (error) {
      console.log('⚠️  Ollama not ready. Start with: ollama serve');
    }

    // Check Coqui TTS
    try {
      await axios.get(`${CONFIG.COQUI_TTS_API}/api/tts`);
      this.ttsReady = true;
      console.log('✅ Coqui TTS ready');
    } catch (error) {
      console.log('⚠️  Coqui TTS not ready. Start with: tts-server');
    }
  }

  // Speech-to-Text with Whisper (self-hosted)
  async transcribeAudio(audioBuffer) {
    try {
      // Save audio temporarily
      const tempPath = `/tmp/audio_${Date.now()}.wav`;
      fs.writeFileSync(tempPath, audioBuffer);

      // Call Whisper API
      const formData = new FormData();
      formData.append('audio_file', fs.createReadStream(tempPath));

      const response = await axios.post(
        `${CONFIG.WHISPER_API}/asr`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: {
            task: 'transcribe',
            language: 'en',
            output: 'json'
          }
        }
      );

      // Clean up
      fs.unlinkSync(tempPath);

      return response.data.text || '';
    } catch (error) {
      console.error('Whisper transcription error:', error);
      
      // Fallback: Use whisper.cpp directly
      return this.transcribeWithWhisperCpp(audioBuffer);
    }
  }

  // Fallback: Direct whisper.cpp
  async transcribeWithWhisperCpp(audioBuffer) {
    return new Promise((resolve, reject) => {
      const tempPath = `/tmp/audio_${Date.now()}.wav`;
      fs.writeFileSync(tempPath, audioBuffer);

      const whisper = spawn('whisper', [
        tempPath,
        '--model', 'base',
        '--output_format', 'txt'
      ]);

      let output = '';
      whisper.stdout.on('data', (data) => {
        output += data.toString();
      });

      whisper.on('close', (code) => {
        fs.unlinkSync(tempPath);
        resolve(output.trim());
      });

      whisper.on('error', reject);
    });
  }

  // LLM Processing with Llama 3 via Ollama
  async processWithLLM(callState, userMessage) {
    try {
      const messages = [
        {
          role: 'system',
          content: MASTER_PROMPT
        },
        ...callState.conversationHistory.map(msg => ({
          role: msg.role === 'caller' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      const response = await axios.post(
        `${CONFIG.OLLAMA_API}/api/chat`,
        {
          model: 'llama2',  // or llama3.3, mistral, etc.
          messages: messages,
          stream: false,
          format: 'json',  // Request JSON response
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 512
          }
        }
      );

      const textResponse = response.data.message.content;
      
      // Parse JSON response
      try {
        return JSON.parse(textResponse);
      } catch {
        // Fallback if not JSON
        return {
          state: callState.state,
          message: textResponse,
          action: null,
          triage_level: 'UNKNOWN',
          escalate: false
        };
      }
    } catch (error) {
      console.error('Ollama error:', error);
      throw error;
    }
  }

  // Text-to-Speech with Coqui TTS (self-hosted)
  async synthesizeSpeech(text) {
    try {
      const response = await axios.get(
        `${CONFIG.COQUI_TTS_API}/api/tts`,
        {
          params: {
            text: text,
            speaker_id: CONFIG.TTS_SPEAKER,
            language_id: CONFIG.TTS_LANGUAGE
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Coqui TTS error:', error);
      
      // Fallback: Use piper TTS (faster, lighter)
      return this.synthesizeWithPiper(text);
    }
  }

  // Fallback: Piper TTS (much faster and lighter)
  async synthesizeWithPiper(text) {
    return new Promise((resolve, reject) => {
      const outputPath = `/tmp/tts_${Date.now()}.wav`;
      
      const piper = spawn('piper', [
        '--model', '/models/en_US-lessac-medium.onnx',
        '--output_file', outputPath
      ]);

      piper.stdin.write(text);
      piper.stdin.end();

      piper.on('close', (code) => {
        if (code === 0) {
          const audio = fs.readFileSync(outputPath);
          fs.unlinkSync(outputPath);
          resolve(audio);
        } else {
          reject(new Error(`Piper failed with code ${code}`));
        }
      });

      piper.on('error', reject);
    });
  }

  // Alternative: Use Transformers.js (runs in Node.js, no Python needed!)
  async initTransformersJS() {
    const { pipeline } = await import('@xenova/transformers');
    
    // Load models (downloads once, caches locally)
    this.asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
    this.llm = await pipeline('text-generation', 'Xenova/llama-160m');
    this.tts = await pipeline('text-to-speech', 'Xenova/speecht5_tts');
    
    console.log('✅ Transformers.js loaded (all models running in Node.js!)');
  }

  async transcribeWithTransformers(audioBuffer) {
    const result = await this.asr(audioBuffer);
    return result.text;
  }

  async generateWithTransformers(messages) {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const result = await this.llm(prompt, {
      max_new_tokens: 256,
      temperature: 0.7
    });
    return result[0].generated_text;
  }

  async speakWithTransformers(text) {
    const result = await this.tts(text);
    return result.audio;
  }
}

// =============================================================================
// CALL STATE MANAGER (SAME AS BEFORE)
// =============================================================================

class CallStateManager {
  constructor(callId) {
    this.callId = callId;
    this.state = 'GREETING';
    this.mode = 'INBOUND';
    this.conversationHistory = [];
    this.symptoms = [];
    this.triageLevel = 'UNKNOWN';
    this.consentGiven = false;
    this.startTime = Date.now();
    this.metadata = {};
  }

  addMessage(role, content) {
    this.conversationHistory.push({ role, content, timestamp: Date.now() });
  }

  updateState(newState) {
    console.log(`[${this.callId}] State transition: ${this.state} → ${newState}`);
    this.state = newState;
  }

  setTriageLevel(level) {
    if (['RED', 'YELLOW', 'GREEN'].includes(level)) {
      this.triageLevel = level;
      console.log(`[${this.callId}] Triage level set to: ${level}`);
    }
  }

  shouldEscalate() {
    return this.triageLevel === 'RED' || 
           this.state === 'HANDOFF' ||
           (Date.now() - this.startTime) > CONFIG.MAX_CALL_DURATION;
  }

  getSummary() {
    return {
      callId: this.callId,
      duration: Date.now() - this.startTime,
      state: this.state,
      mode: this.mode,
      triageLevel: this.triageLevel,
      symptoms: this.symptoms,
      conversationHistory: this.conversationHistory,
      metadata: this.metadata
    };
  }
}

// =============================================================================
// TOOLS (SAME AS BEFORE)
// =============================================================================

class ToolExecutor {
  async triggerEmergencyWorkflow(callState) {
    console.log(`🚨 EMERGENCY TRIGGERED for call ${callState.callId}`);
    
    if (CONFIG.N8N_WEBHOOK_URL) {
      try {
        await axios.post(`${CONFIG.N8N_WEBHOOK_URL}/emergency`, {
          callId: callState.callId,
          triageLevel: 'RED',
          symptoms: callState.symptoms,
          timestamp: new Date().toISOString(),
          summary: callState.getSummary()
        });
      } catch (error) {
        console.error('n8n emergency webhook failed:', error);
      }
    }

    return {
      success: true,
      action: 'emergency_initiated'
    };
  }

  async scheduleAppointment(callState) {
    console.log(`📅 Scheduling appointment for call ${callState.callId}`);
    
    if (CONFIG.N8N_WEBHOOK_URL) {
      await axios.post(`${CONFIG.N8N_WEBHOOK_URL}/schedule-appointment`, {
        callId: callState.callId,
        symptoms: callState.symptoms,
        timestamp: new Date().toISOString()
      });
    }

    return { success: true, action: 'appointment_scheduled' };
  }

  async handoffToHuman(callState, reason = '') {
    console.log(`👤 Handing off to human for call ${callState.callId}`);
    
    if (CONFIG.N8N_WEBHOOK_URL) {
      await axios.post(`${CONFIG.N8N_WEBHOOK_URL}/human-handoff`, {
        callId: callState.callId,
        reason,
        summary: callState.getSummary()
      });
    }

    return { success: true, action: 'human_handoff' };
  }
}

// =============================================================================
// WEBSOCKET SERVER (SAME STRUCTURE)
// =============================================================================

class VoiceWebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.activeCalls = new Map();
    this.aiEngine = new OpenSourceVoiceAI();
    this.toolExecutor = new ToolExecutor();

    this.wss.on('connection', (ws, req) => {
      const callId = this.generateCallId();
      const callState = new CallStateManager(callId);
      this.activeCalls.set(callId, { ws, callState });

      console.log(`📞 New call connected: ${callId}`);

      ws.on('message', async (data) => {
        await this.handleMessage(callId, data);
      });

      ws.on('close', () => {
        console.log(`📞 Call ended: ${callId}`);
        this.toolExecutor.logCallSummary(callState);
        this.activeCalls.delete(callId);
      });

      this.sendGreeting(callId);
    });
  }

  generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendGreeting(callId) {
    const { ws, callState } = this.activeCalls.get(callId);
    
    const greeting = await this.aiEngine.processWithLLM(
      callState,
      '[SYSTEM: Initiate greeting for new caller]'
    );

    callState.addMessage('assistant', greeting.message);
    callState.updateState(greeting.state);

    const audioBuffer = await this.aiEngine.synthesizeSpeech(greeting.message);
    
    ws.send(JSON.stringify({
      type: 'audio',
      audio: audioBuffer.toString('base64'),
      text: greeting.message
    }));
  }

  async handleMessage(callId, data) {
    const { ws, callState } = this.activeCalls.get(callId);

    try {
      const message = JSON.parse(data);

      if (message.type === 'audio') {
        let audioBufferDecoded = Buffer.from(message.audio, 'base64');
        const transcript = await this.aiEngine.transcribeAudio(audioBufferDecoded);
        
        console.log(`[${callId}] User: ${transcript}`);
        callState.addMessage('caller', transcript);

        const response = await this.aiEngine.processWithLLM(callState, transcript);
        
        callState.updateState(response.state);
        if (response.triage_level) {
          callState.setTriageLevel(response.triage_level);
        }

        if (response.action) {
          await this.executeAction(callId, response.action, response);
        }

        if (response.escalate || callState.shouldEscalate()) {
          await this.toolExecutor.handoffToHuman(callState, 'AI escalation');
        }

        callState.addMessage('assistant', response.message);
        const audioBuffer = await this.aiEngine.synthesizeSpeech(response.message);
        
        ws.send(JSON.stringify({
          type: 'audio',
          audio: audioBuffer.toString('base64'),
          text: response.message,
          state: response.state,
          triageLevel: response.triage_level
        }));
      }
    } catch (error) {
      console.error(`Error handling message for ${callId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Technical difficulties. Connecting you with help.'
      }));
      
      await this.toolExecutor.handoffToHuman(callState, 'Technical error');
    }
  }

  async executeAction(callId, action, response) {
    const { callState } = this.activeCalls.get(callId);

    switch (action) {
      case 'trigger_emergency_workflow':
        await this.toolExecutor.triggerEmergencyWorkflow(callState);
        break;
      case 'schedule_appointment':
        await this.toolExecutor.scheduleAppointment(callState);
        break;
      case 'handoff_human':
        await this.toolExecutor.handoffToHuman(callState, response.message);
        break;
    }
  }
}

// =============================================================================
// EXPRESS SERVER
// =============================================================================

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    models: 'open-source',
    cost: '$0/month',
    timestamp: new Date().toISOString() 
  });
});

app.post('/fonoster/inbound', async (req, res) => {
  res.json({
    action: 'connect',
    websocket_url: `wss://${req.headers.host}/voice`
  });
});

// =============================================================================
// START SERVER
// =============================================================================

const server = app.listen(CONFIG.PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 ApneDoctors Voice AI - OPEN SOURCE VERSION           ║
║  Running on port ${CONFIG.PORT}                                  ║
║  💰 Monthly API costs: $0                                 ║
║  🆓 Using: Whisper + Llama 3 + Coqui TTS                 ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

new VoiceWebSocketServer(server);

module.exports = { VoiceWebSocketServer, OpenSourceVoiceAI, CallStateManager };
