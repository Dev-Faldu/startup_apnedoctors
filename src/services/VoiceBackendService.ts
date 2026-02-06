// Voice Backend Service - Connects frontend to local voice AI backend
class VoiceBackendService {
  private ws: WebSocket | null = null;
  private backendUrl: string;
  private websocketUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_VOICE_BACKEND_URL || 'http://localhost:54112';
    this.websocketUrl = import.meta.env.VITE_VOICE_WEBSOCKET_URL || 'ws://localhost:54112';
  }

  // Connect to voice backend WebSocket
  async connect(onMessage: (data: unknown) => void, onError: (error: Event) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.websocketUrl);

        this.ws.onopen = () => {
          console.log('✅ Connected to voice backend');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Voice backend WebSocket error:', error);
          onError(error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Voice backend connection closed');
        };

      } catch (error) {
        console.error('Failed to connect to voice backend:', error);
        reject(error);
      }
    });
  }

  // Send audio data to voice backend
  sendAudio(audioBlob: Blob): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Voice backend not connected');
      return;
    }

    // Convert blob to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = (reader.result as string).split(',')[1];
      this.ws!.send(JSON.stringify({
        type: 'audio',
        audio: base64Audio
      }));
    };
    reader.readAsDataURL(audioBlob);
  }

  // Send text message (for testing)
  sendMessage(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Voice backend not connected');
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'text',
      message: text
    }));
  }

  // Disconnect from voice backend
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Test connection to voice backend
  async testConnection(): Promise<{ connected: boolean; health?: Record<string, unknown> }> {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      if (!response.ok) {
        return { connected: false };
      }
      const health = await response.json();
      return { connected: true, health };
    } catch (error) {
      console.error('Voice backend health check failed:', error);
      return { connected: false };
    }
  }

  // Get voice backend dashboard
  async getDashboard(): Promise<string> {
    try {
      const response = await fetch(this.backendUrl);
      return await response.text();
    } catch (error) {
      console.error('Failed to get voice backend dashboard:', error);
      return '<h1>Voice Backend Not Available</h1><p>Please start the voice backend service.</p>';
    }
  }
}

// Singleton instance
export const voiceBackendService = new VoiceBackendService();
export default voiceBackendService;