import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * ApneDoctors Voice Assistant UI Components
 * Premium medical interface with real-time voice interaction
 */

// =============================================================================
// VOICE ASSISTANT MODAL
// =============================================================================

export const VoiceAssistantModal = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [callState, setCallState] = useState('idle');
  const [triageLevel, setTriageLevel] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [isOpen]);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('Voice AI connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'audio') {
        setAssistantMessage(data.text);
        setCallState(data.state);
        if (data.triageLevel) {
          setTriageLevel(data.triageLevel);
        }
        
        // Play audio response
        playAudioResponse(data.audio);
      } else if (data.type === 'text') {
        setAssistantMessage(data.text);
        setCallState(data.state);
      }
    };

    ws.onclose = () => {
      console.log('Voice AI disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start visualization
      visualizeAudio();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Audio = reader.result.split(',')[1];
            wsRef.current.send(JSON.stringify({
              type: 'audio',
              audio: base64Audio
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(1000); // Send chunks every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setAudioLevel(0);
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      if (isRecording) {
        requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const playAudioResponse = async (base64Audio) => {
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleEndCall = () => {
    disconnectWebSocket();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
        
        {/* Ambient Background Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className={`absolute inset-0 bg-gradient-to-br ${
            triageLevel === 'RED' ? 'from-red-500/20 to-orange-500/20' :
            triageLevel === 'YELLOW' ? 'from-yellow-500/20 to-amber-500/20' :
            triageLevel === 'GREEN' ? 'from-green-500/20 to-emerald-500/20' :
            'from-blue-500/20 to-indigo-500/20'
          } animate-pulse`} />
        </div>

        {/* Header */}
        <div className="relative p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'
              }`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">APNE Voice Assistant</h2>
                <p className="text-sm text-slate-400">
                  {isConnected ? 'Connected' : 'Connecting...'}
                  {callState !== 'idle' && ` • ${callState}`}
                </p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative p-8 space-y-6 max-h-96 overflow-y-auto">
          
          {/* Triage Indicator */}
          {triageLevel && (
            <div className={`flex items-center gap-3 p-4 rounded-2xl ${
              triageLevel === 'RED' ? 'bg-red-500/10 border border-red-500/30' :
              triageLevel === 'YELLOW' ? 'bg-yellow-500/10 border border-yellow-500/30' :
              'bg-green-500/10 border border-green-500/30'
            }`}>
              <AlertCircle className={`w-5 h-5 ${
                triageLevel === 'RED' ? 'text-red-400' :
                triageLevel === 'YELLOW' ? 'text-yellow-400' :
                'text-green-400'
              }`} />
              <span className={`text-sm font-medium ${
                triageLevel === 'RED' ? 'text-red-300' :
                triageLevel === 'YELLOW' ? 'text-yellow-300' :
                'text-green-300'
              }`}>
                Priority Assessment: {triageLevel}
              </span>
            </div>
          )}

          {/* Assistant Message */}
          {assistantMessage && (
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">APNE</p>
                  <p className="text-white leading-relaxed">{assistantMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* User Transcript */}
          {transcript && (
            <div className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-600/50 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">You</p>
                  <p className="text-slate-200 leading-relaxed">{transcript}</p>
                </div>
              </div>
            </div>
          )}

          {/* Audio Visualization */}
          {isRecording && (
            <div className="flex items-center gap-2 justify-center py-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(8, audioLevel * 100 * (Math.sin(i * 0.5) + 1))}px`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="relative p-6 border-t border-slate-700/50">
          <div className="flex items-center justify-center gap-4">
            
            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
                  : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-slate-700/50 hover:bg-red-500 flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-slate-600/50"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 mt-4">
            {isRecording ? 'Listening...' : 'Click to speak'}
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// FLOATING VOICE BUTTON
// =============================================================================

export const FloatingVoiceButton = ({ onClick }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-40 group"
    >
      {/* Pulse Effect */}
      <div className={`absolute inset-0 bg-blue-500/30 rounded-full animate-ping ${
        isPulsing ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-1000`} />
      
      {/* Main Button */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/50 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/70">
        <Activity className="w-7 h-7 text-white" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        Talk to APNE
        <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 transform rotate-45 -mt-1" />
      </div>
    </button>
  );
};

// =============================================================================
// CALL HISTORY COMPONENT
// =============================================================================

export const CallHistory = ({ calls = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Call History</h3>
        <p className="text-sm text-slate-600 mt-1">Your recent conversations with APNE</p>
      </div>

      <div className="divide-y divide-slate-200">
        {calls.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No calls yet</p>
            <p className="text-sm text-slate-400 mt-1">Your call history will appear here</p>
          </div>
        ) : (
          calls.map((call) => (
            <div key={call.id} className="p-6 hover:bg-slate-50 transition-colors duration-150">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    call.triageLevel === 'RED' ? 'bg-red-100 text-red-600' :
                    call.triageLevel === 'YELLOW' ? 'bg-yellow-100 text-yellow-600' :
                    call.triageLevel === 'GREEN' ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-900">
                      {call.type === 'inbound' ? 'Incoming Call' : 'Outbound Call'}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{call.summary}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {call.duration}
                      </span>
                      {call.triageLevel && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          call.triageLevel === 'RED' ? 'bg-red-100 text-red-700' :
                          call.triageLevel === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {call.triageLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-sm text-slate-500">{call.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// =============================================================================
// LIVE TRANSCRIPT VIEWER
// =============================================================================

export const LiveTranscript = ({ transcript = [], isLive = false }) => {
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Live Transcript</h3>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400">LIVE</span>
          </div>
        )}
      </div>

      <div className="p-4 h-96 overflow-y-auto space-y-3 font-mono text-sm">
        {transcript.map((entry, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              entry.role === 'assistant' ? 'text-blue-400' : 'text-green-400'
            }`}
          >
            <span className="text-slate-500 flex-shrink-0">
              {entry.timestamp}
            </span>
            <span className="font-semibold flex-shrink-0 min-w-[80px]">
              {entry.role === 'assistant' ? 'APNE:' : 'CALLER:'}
            </span>
            <span className="text-slate-300">{entry.content}</span>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
};

export default {
  VoiceAssistantModal,
  FloatingVoiceButton,
  CallHistory,
  LiveTranscript
};
