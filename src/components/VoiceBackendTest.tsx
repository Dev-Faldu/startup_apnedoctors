import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import voiceBackendService from '@/services/VoiceBackendService';

export default function VoiceBackendTest() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<Array<{type: string, content: string, timestamp: Date}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addMessage = (type: string, content: string) => {
    setMessages(prev => [...prev.slice(-9), { type, content, timestamp: new Date() }]);
  };

  const testConnection = useCallback(async () => {
    setStatus('connecting');
    try {
      const result = await voiceBackendService.testConnection();
      if (result.connected) {
        setStatus('connected');
        setHealth(result.health);
        addMessage('system', '✅ Voice backend connected successfully');
      } else {
        setStatus('error');
        addMessage('system', '❌ Voice backend not responding');
      }
    } catch (error) {
      setStatus('error');
      addMessage('system', `❌ Connection error: ${error}`);
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  const connectWebSocket = async () => {
    if (voiceBackendService.isConnected()) {
      voiceBackendService.disconnect();
      setStatus('disconnected');
      addMessage('system', '🔌 Disconnected from voice backend');
      return;
    }

    setStatus('connecting');
    addMessage('system', '🔌 Connecting to voice backend...');

    try {
      await voiceBackendService.connect(
        (data) => {
          console.log('Received:', data);
          if (data.type === 'audio') {
            addMessage('assistant', `🎵 Audio response received (${data.audio.length} chars)`);
            // In a real app, you'd play the audio here
          } else if (data.type === 'error') {
            addMessage('error', `❌ ${data.message}`);
          } else {
            addMessage('assistant', data.text || JSON.stringify(data));
          }
        },
        (error) => {
          setStatus('error');
          addMessage('error', `WebSocket error: ${error}`);
        }
      );
      setStatus('connected');
      addMessage('system', '✅ WebSocket connected');
    } catch (error) {
      setStatus('error');
      addMessage('error', `Failed to connect: ${error}`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        voiceBackendService.sendAudio(audioBlob);
        addMessage('user', '🎤 Audio sent to voice backend');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      addMessage('system', '🎤 Recording started...');
    } catch (error) {
      addMessage('error', `Microphone error: ${error}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      addMessage('system', '🎤 Recording stopped');
    }
  };

  const sendTestMessage = () => {
    voiceBackendService.sendMessage('Hello, this is a test message from the frontend!');
    addMessage('user', '💬 Test message sent');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔊 Voice Backend Test Console</CardTitle>
          <CardDescription>
            Test connection between frontend and voice AI backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'connected' ? 'bg-green-100 text-green-800' :
              status === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
              status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Status: {status}
            </div>
            {health && (
              <div className="text-sm text-gray-600">
                Platform: {health.platform} | Models: {health.models}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testConnection} variant="outline">
              🔍 Test Connection
            </Button>
            <Button
              onClick={connectWebSocket}
              variant={voiceBackendService.isConnected() ? "destructive" : "default"}
            >
              {voiceBackendService.isConnected() ? '🔌 Disconnect' : '🔌 Connect WebSocket'}
            </Button>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              disabled={!voiceBackendService.isConnected()}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
            </Button>
            <Button
              onClick={sendTestMessage}
              variant="outline"
              disabled={!voiceBackendService.isConnected()}
            >
              💬 Send Test Message
            </Button>
          </div>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📝 Message Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No messages yet. Connect and send audio/text to see responses.
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className={`p-2 rounded border ${
                      msg.type === 'error' ? 'bg-red-50 border-red-200' :
                      msg.type === 'assistant' ? 'bg-blue-50 border-blue-200' :
                      msg.type === 'user' ? 'bg-green-50 border-green-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{msg.type}</span>
                        <span className="text-gray-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1">{msg.content}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>How to test:</strong><br/>
              1. Click "Test Connection" to check if voice backend is running<br/>
              2. Click "Connect WebSocket" to establish real-time connection<br/>
              3. Click "Start Recording" and speak - your audio will be processed by AI<br/>
              4. Or click "Send Test Message" to send text<br/>
              5. Watch the message log for responses from the voice backend
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}