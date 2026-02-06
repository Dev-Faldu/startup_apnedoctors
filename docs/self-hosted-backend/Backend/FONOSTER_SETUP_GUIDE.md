# Fonoster Integration Guide for ApneDoctors
### Complete Telephony Setup for Voice AI System

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Inbound Call Setup](#inbound-call-setup)
5. [Outbound Call Setup](#outbound-call-setup)
6. [Integration with Voice AI Backend](#integration)
7. [Production Deployment](#production)

---

## Overview

Fonoster is an open-source alternative to Twilio that provides:
- ✅ SIP-based telephony
- ✅ WebRTC support
- ✅ Programmable voice APIs
- ✅ Self-hosted control
- ✅ Cost-effective scaling

This guide integrates Fonoster with your ApneDoctors Voice AI Backend.

---

## Installation

### Prerequisites
- Node.js 18+ installed
- Docker and Docker Compose
- Domain name with SSL certificate (for production)
- SIP trunk provider account (e.g., Telnyx, Bandwidth, Twilio)

### Step 1: Install Fonoster

```bash
# Clone Fonoster
git clone https://github.com/fonoster/fonoster.git
cd fonoster

# Install dependencies
npm install

# Start Fonoster services with Docker
docker-compose up -d
```

### Step 2: Verify Installation

```bash
# Check Fonoster is running
docker ps | grep fonoster

# Should see:
# - fonoster-apiserver
# - fonoster-sipproxy
# - fonoster-mediaserver
# - fonoster-redis
# - fonoster-mongodb
```

### Step 3: Install Fonoster SDK

```bash
# In your ApneDoctors backend directory
npm install @fonoster/sdk
```

---

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Fonoster Configuration
FONOSTER_API_URL=http://localhost:50051
FONOSTER_ACCESS_KEY_ID=your_access_key
FONOSTER_ACCESS_KEY_SECRET=your_secret_key
FONOSTER_DOMAIN=voice.apnedoctors.com
FONOSTER_INBOUND_NUMBER=+1234567890

# SIP Trunk Configuration
SIP_TRUNK_PROVIDER=telnyx
SIP_TRUNK_USERNAME=your_username
SIP_TRUNK_PASSWORD=your_password
SIP_TRUNK_HOST=sip.telnyx.com

# Voice AI Backend
VOICE_AI_WEBHOOK_URL=https://api.apnedoctors.com/voice
```

### Fonoster Configuration File

Create `fonoster-config.yml`:

```yaml
apiVersion: v1
metadata:
  name: apnedoctors-voice-config

spec:
  # SIP Domain
  domain:
    name: voice.apnedoctors.com
    egressNumberRef: apne-outbound-number
    
  # Numbers
  numbers:
    - name: apne-inbound-number
      number: +1234567890
      webhookUrl: https://api.apnedoctors.com/voice/inbound
      
  # SIP Trunks
  trunks:
    - name: primary-trunk
      inboundUri: sip.telnyx.com
      accessControlList:
        allow:
          - 0.0.0.0/0
      credentials:
        username: ${SIP_TRUNK_USERNAME}
        password: ${SIP_TRUNK_PASSWORD}
        
  # Agents (for call routing)
  agents:
    - name: voice-ai-agent
      endpoint: wss://api.apnedoctors.com/voice/websocket
```

---

## Inbound Call Setup

### Create Fonoster Inbound Handler

`fonoster-inbound-handler.js`:

```javascript
const { VoiceServer } = require('@fonoster/voice');
const WebSocket = require('ws');

class ApneInboundHandler {
  constructor(voiceAIBackendURL) {
    this.voiceAIBackendURL = voiceAIBackendURL;
    this.server = new VoiceServer({
      port: 3000
    });
  }

  async handleInboundCall(call) {
    console.log(`📞 Inbound call from: ${call.from}`);

    try {
      // Answer the call
      await call.answer();

      // Connect to Voice AI WebSocket
      const ws = new WebSocket(this.voiceAIBackendURL);

      // Stream audio to AI
      const audioStream = call.getAudioStream();
      
      audioStream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'audio',
            audio: chunk.toString('base64'),
            metadata: {
              callId: call.callId,
              from: call.from,
              to: call.to,
              timestamp: Date.now()
            }
          }));
        }
      });

      // Receive AI responses
      ws.on('message', async (data) => {
        const response = JSON.parse(data);
        
        if (response.type === 'audio') {
          // Play AI audio to caller
          const audioBuffer = Buffer.from(response.audio, 'base64');
          await call.play(audioBuffer);
        }

        if (response.action === 'transfer') {
          // Transfer to human
          await call.transfer(response.transferTo);
        }

        if (response.action === 'hangup') {
          await call.hangup();
        }
      });

      // Handle call end
      call.on('hangup', () => {
        console.log(`Call ended: ${call.callId}`);
        ws.close();
      });

    } catch (error) {
      console.error('Error handling inbound call:', error);
      await call.hangup();
    }
  }

  start() {
    this.server.listen((call) => {
      this.handleInboundCall(call);
    });

    console.log('🎙️ Fonoster inbound handler listening...');
  }
}

// Start the handler
const handler = new ApneInboundHandler('ws://localhost:3001');
handler.start();

module.exports = ApneInboundHandler;
```

### Register with Fonoster

```javascript
const Fonoster = require('@fonoster/sdk');

const client = new Fonoster.Client({
  accessKeyId: process.env.FONOSTER_ACCESS_KEY_ID,
  accessKeySecret: process.env.FONOSTER_ACCESS_KEY_SECRET
});

async function registerInboundNumber() {
  const numbers = new Fonoster.Numbers(client);
  
  await numbers.createNumber({
    number: '+1234567890',
    webhookUrl: 'https://api.apnedoctors.com/voice/inbound',
    cityOrProvince: 'New York',
    country: 'USA'
  });

  console.log('✅ Inbound number registered');
}

registerInboundNumber();
```

---

## Outbound Call Setup

### Create Outbound Call Function

```javascript
const Fonoster = require('@fonoster/sdk');

class OutboundCallManager {
  constructor(client) {
    this.client = client;
    this.calls = new Fonoster.Calls(client);
  }

  async makeOutboundCall(config) {
    const {
      to,
      purpose,
      context,
      patientName,
      appointmentDetails
    } = config;

    try {
      console.log(`📞 Initiating outbound call to ${to}`);

      const call = await this.calls.create({
        from: process.env.FONOSTER_INBOUND_NUMBER,
        to: to,
        webhook: `${process.env.VOICE_AI_WEBHOOK_URL}/outbound`,
        metadata: {
          purpose,
          context,
          patientName,
          appointmentDetails
        }
      });

      console.log(`✅ Outbound call initiated: ${call.callId}`);
      
      return {
        success: true,
        callId: call.callId,
        status: 'initiated'
      };

    } catch (error) {
      console.error('Error making outbound call:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleOutboundWebhook(req, res) {
    const { callId, status, metadata } = req.body;

    console.log(`Outbound call status: ${callId} - ${status}`);

    if (status === 'answered') {
      // Call was answered, start AI conversation
      return res.json({
        action: 'connect',
        websocketUrl: process.env.VOICE_AI_WEBSOCKET_URL,
        context: metadata
      });
    }

    if (status === 'no-answer' || status === 'busy') {
      // Schedule retry via n8n
      await this.scheduleRetry(callId, metadata);
      return res.json({ action: 'hangup' });
    }

    return res.json({ action: 'continue' });
  }

  async scheduleRetry(callId, metadata) {
    // Trigger n8n workflow for retry
    const axios = require('axios');
    
    await axios.post(`${process.env.N8N_WEBHOOK_URL}/call-retry`, {
      callId,
      metadata,
      retryAt: new Date(Date.now() + 3600000) // Retry in 1 hour
    });
  }
}

// Example usage
const client = new Fonoster.Client({
  accessKeyId: process.env.FONOSTER_ACCESS_KEY_ID,
  accessKeySecret: process.env.FONOSTER_ACCESS_KEY_SECRET
});

const outboundManager = new OutboundCallManager(client);

// Make appointment reminder call
outboundManager.makeOutboundCall({
  to: '+19876543210',
  purpose: 'appointment_reminder',
  patientName: 'John Doe',
  context: {
    appointmentDate: '2026-02-10',
    appointmentTime: '10:00 AM',
    doctorName: 'Dr. Smith',
    location: 'ApneDoctors Main Clinic'
  }
});

module.exports = OutboundCallManager;
```

---

## Integration with Voice AI Backend

### Add Fonoster Routes to Express Server

Add to your `voice-ai-backend.js`:

```javascript
const Fonoster = require('@fonoster/sdk');
const OutboundCallManager = require('./outbound-call-manager');

// Initialize Fonoster client
const fonosterClient = new Fonoster.Client({
  accessKeyId: CONFIG.FONOSTER_ACCESS_KEY_ID,
  accessKeySecret: CONFIG.FONOSTER_ACCESS_KEY_SECRET
});

const outboundManager = new OutboundCallManager(fonosterClient);

// Fonoster inbound webhook
app.post('/voice/inbound', async (req, res) => {
  const { callId, from, to } = req.body;
  
  console.log(`📞 Inbound call: ${callId} from ${from}`);

  // Return WebSocket connection instructions
  res.json({
    action: 'connect',
    websocketUrl: `wss://${req.headers.host}/voice/stream`,
    context: {
      mode: 'INBOUND',
      callId,
      from,
      to
    }
  });
});

// Fonoster outbound webhook
app.post('/voice/outbound', async (req, res) => {
  await outboundManager.handleOutboundWebhook(req, res);
});

// API endpoint to trigger outbound call
app.post('/api/outbound-call', async (req, res) => {
  const result = await outboundManager.makeOutboundCall(req.body);
  res.json(result);
});

// Call transfer endpoint
app.post('/api/transfer-call', async (req, res) => {
  const { callId, transferTo } = req.body;
  
  try {
    const calls = new Fonoster.Calls(fonosterClient);
    await calls.transfer(callId, transferTo);
    
    res.json({
      success: true,
      message: 'Call transferred successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## Production Deployment

### 1. SSL/TLS Setup

```nginx
# nginx configuration for Fonoster
server {
    listen 443 ssl http2;
    server_name voice.apnedoctors.com;

    ssl_certificate /etc/letsencrypt/live/voice.apnedoctors.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/voice.apnedoctors.com/privkey.pem;

    # WebSocket support
    location /voice/stream {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # REST API
    location /voice/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Docker Compose for Production

`docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  fonoster:
    image: fonoster/fonoster:latest
    ports:
      - "50051:50051"  # gRPC API
      - "5060:5060"    # SIP
      - "10000-20000:10000-20000/udp"  # RTP
    environment:
      - FONOSTER_ACCESS_KEY_ID=${FONOSTER_ACCESS_KEY_ID}
      - FONOSTER_ACCESS_KEY_SECRET=${FONOSTER_ACCESS_KEY_SECRET}
    volumes:
      - ./fonoster-data:/var/lib/fonoster
      - ./fonoster-config.yml:/etc/fonoster/config.yml
    restart: unless-stopped

  voice-ai-backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - FONOSTER_API_URL=http://fonoster:50051
    depends_on:
      - fonoster
    restart: unless-stopped
```

### 3. Monitoring & Logging

```javascript
// Add to voice-ai-backend.js

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'calls.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Log all calls
app.use((req, res, next) => {
  if (req.path.startsWith('/voice/')) {
    logger.info({
      type: 'voice_request',
      path: req.path,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }
  next();
});
```

### 4. Health Checks

```javascript
// Health check for Fonoster connectivity
app.get('/health/fonoster', async (req, res) => {
  try {
    const status = await fonosterClient.getStatus();
    res.json({
      status: 'healthy',
      fonoster: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## Testing

### Test Inbound Call

```bash
# Using SIP client or softphone, call:
# +1234567890 (your Fonoster number)

# Or use curl to simulate webhook:
curl -X POST http://localhost:3001/voice/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test-call-123",
    "from": "+19876543210",
    "to": "+1234567890"
  }'
```

### Test Outbound Call

```bash
curl -X POST http://localhost:3001/api/outbound-call \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+19876543210",
    "purpose": "test",
    "patientName": "Test Patient",
    "context": {
      "message": "This is a test call from ApneDoctors"
    }
  }'
```

---

## Troubleshooting

### Common Issues

**1. SIP Connection Fails**
```bash
# Check SIP trunk credentials
fonoster trunks list

# Test SIP connectivity
sip-cli test sip.telnyx.com
```

**2. Audio Quality Issues**
```yaml
# Adjust codec settings in fonoster-config.yml
codecs:
  - name: PCMU
    priority: 1
  - name: PCMA
    priority: 2
```

**3. WebSocket Connection Drops**
```javascript
// Add reconnection logic
const connectWithRetry = () => {
  const ws = new WebSocket(wsUrl);
  
  ws.on('error', () => {
    setTimeout(connectWithRetry, 5000);
  });
};
```

---

## Cost Comparison

| Provider | Monthly Cost (1000 mins) | Setup Fee |
|----------|--------------------------|-----------|
| Twilio   | ~$100                    | $0        |
| Fonoster | ~$20-30 (SIP trunk only) | $0        |
| Self-hosted | ~$10 (server costs)   | Dev time  |

---

## Next Steps

1. ✅ Set up Fonoster
2. ✅ Configure SIP trunk
3. ✅ Test inbound calls
4. ✅ Test outbound calls
5. ✅ Deploy to production
6. 🔄 Monitor and optimize

Your ApneDoctors voice AI is now production-ready! 🚀
