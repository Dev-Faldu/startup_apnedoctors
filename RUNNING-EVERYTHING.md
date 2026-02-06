# 🚀 ApneDoctors - Complete System Runner

## Overview

This guide shows you how to run the **complete ApneDoctors healthcare platform** - frontend, backend, AI services, and automation workflows.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ApneDoctors Platform                      │
├─────────────────────────────────────────────────────────────┤
│  🌐 Frontend (Vercel)      │  🔊 Voice AI (Local)          │
│  - React/TypeScript        │  - Transformers.js Whisper     │
│  - Clinical Assessments    │  - Ollama Llama 3             │
│  - Real-time UI            │  - Piper TTS                  │
├────────────────────────────┼────────────────────────────────┤
│  🗄️ Backend (Supabase)     │  🔄 Automation (n8n)          │
│  - Edge Functions          │  - Emergency Workflows        │
│  - PostgreSQL Database     │  - User Onboarding            │
│  - Real-time Subscriptions │  - Report Processing          │
└────────────────────────────┴────────────────────────────────┘
```

## 🎯 Quick Start (3 Steps)

### Step 1: Setup Development Environment
```bash
# Run development setup
dev-setup.bat
```

### Step 2: Start All Services
```bash
# Run everything automatically
run-everything.bat
```

### Step 3: Check Status
```bash
# Verify everything is working
status-check.bat
```

## 📋 Detailed Component Guide

### 1. 🌐 Frontend (React + Vercel)

**Status**: ✅ Already deployed and running
**URL**: https://startup-apnedoctors.vercel.app

**Features:**
- Clinical assessment wizard
- Real-time voice conversations
- Document analysis
- Doctor dashboard
- Admin panel

**Local Development:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 2. 🔊 Voice AI Backend (Windows-Native)

**Technology**: Node.js + Transformers.js + Ollama + Piper
**Port**: 54112
**Cost**: $0/month

**Components:**
- **Speech-to-Text**: Transformers.js Whisper (runs in Node.js)
- **AI Conversations**: Ollama with Llama 3
- **Text-to-Speech**: Piper (Windows executable)
- **WebSocket**: Real-time audio streaming

**Setup:**
```bash
cd docs/self-hosted-backend/Backend

# Install dependencies
npm install

# Copy environment
copy .env.windows .env

# Start server
node voice-ai-backend-windows.js
```

**Health Check:**
```bash
curl http://localhost:54112/health
# Should return: {"status": "healthy", "platform": "windows", ...}
```

### 3. 🤖 Ollama LLM Service

**Technology**: Local Llama 3 model
**Port**: 11500
**Models**: llama2 (7B parameters)

**Setup:**
```bash
# Install Ollama from: https://ollama.ai/download/windows

# Start service
ollama serve

# Pull model
ollama pull llama2

# Check status
curl http://localhost:11500/api/tags
```

### 4. 🔄 n8n Workflow Automation

**Technology**: Visual workflow automation
**Port**: 5678
**Features**: Emergency alerts, user onboarding, report processing

**Setup:**
```bash
# Install n8n
npm install -g n8n

# Create data directory
mkdir n8n-data

# Start n8n
n8n start

# Or with custom data directory
n8n start --datafolder ./n8n-data
```

**Import Workflows:**
1. Open http://localhost:5678
2. Click "Import from File"
3. Import these workflows:
   - `docs/n8n-workflows/emergency-alert-workflow.json`
   - `docs/n8n-workflows/user-onboarding-workflow.json`
   - `docs/n8n-workflows/medical-report-processing-workflow.json`

### 5. 🗄️ Supabase Backend

**Status**: ✅ Already configured
**Features**:
- PostgreSQL database
- Edge functions (AI processing)
- Real-time subscriptions
- Authentication
- File storage

**Configuration:**
- Environment variables in Vercel dashboard
- Database tables auto-created via migrations
- Edge functions deployed automatically

## 🚀 Running Everything (Automated)

### Option A: One-Click Start
```bash
# Start all services automatically
run-everything.bat
```

This script will:
- ✅ Check Ollama status
- ✅ Start voice backend if needed
- ✅ Start n8n if needed
- ✅ Verify all connections
- ✅ Show access URLs

### Option B: Manual Start

**Terminal 1: Ollama**
```bash
ollama serve
```

**Terminal 2: Voice Backend**
```bash
cd docs\self-hosted-backend\Backend
node voice-ai-backend-windows.js
```

**Terminal 3: n8n Workflows**
```bash
n8n start
```

**Terminal 4: Frontend (Development)**
```bash
npm run dev
```

## 📊 System Status Monitoring

### Quick Status Check
```bash
status-check.bat
```

This will show:
- ✅ Frontend (Vercel)
- ✅ Voice Backend (localhost:54112)
- ✅ Ollama (localhost:11500)
- ✅ n8n (localhost:5678)
- ✅ Supabase connectivity

### Manual Health Checks

**Voice Backend:**
```bash
curl http://localhost:54112/health
```

**Ollama:**
```bash
curl http://localhost:11500/api/tags
```

**n8n:**
```bash
curl http://localhost:5678/healthz
```

**Frontend:**
```bash
curl -I https://startup-apnedoctors.vercel.app
```

## 🔧 Troubleshooting

### Common Issues

**"Ollama not responding"**
```bash
# Check if running
tasklist | findstr ollama

# Restart
ollama serve

# Check port
netstat -ano | findstr 11500
```

**"Voice backend not starting"**
```bash
cd docs\self-hosted-backend\Backend

# Check Node.js
node --version

# Install dependencies
npm install

# Check environment
type .env

# Start with debug
node voice-ai-backend-windows.js
```

**"n8n not accessible"**
```bash
# Check if running
netstat -ano | findstr 5678

# Start n8n
n8n start

# Access at http://localhost:5678
```

**"Frontend build failing"**
```bash
# Clear cache
npm run clean

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Build
npm run build
```

### Component-Specific Issues

**Transformers.js Issues:**
```bash
# Clear cache
rm -rf node_modules/.cache

# Reinstall
npm uninstall @xenova/transformers onnxruntime-node
npm install @xenova/transformers onnxruntime-node
```

**Piper TTS Issues:**
```bash
# Manual download required
# See: setup-piper-manual.bat
```

**Supabase Issues:**
- Check environment variables in Vercel dashboard
- Verify database connectivity
- Check edge function logs

## 🎯 Access Points

### Production URLs
- **Frontend**: https://startup-apnedoctors.vercel.app
- **Voice API**: https://your-domain.com/voice (when deployed)
- **Admin**: https://startup-apnedoctors.vercel.app/admin

### Local Development URLs
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Voice Backend**: http://localhost:54112
- **Ollama**: http://localhost:11500
- **n8n**: http://localhost:5678

## 📈 Performance & Scaling

### Development Setup
- All services run locally
- No internet dependency for core features
- Full debugging capabilities

### Production Deployment
- Frontend: Vercel (global CDN)
- Backend: Supabase (managed)
- Voice AI: VPS or cloud instance
- n8n: Railway/Render/Heroku

### Cost Optimization
- **Local AI**: $0/month (your hardware)
- **Cloud Hosting**: $10-50/month
- **APIs**: $0 (no external AI APIs)
- **Total**: $10-50/month

## 🔒 Security Considerations

### Local Development
- All data stays on your machine
- No external API calls
- Safe for medical data testing

### Production Security
- HTTPS everywhere
- HIPAA-compliant data handling
- Encrypted database connections
- Secure WebSocket connections
- Audit logging

## 🎉 Ready to Use!

Once everything is running, you can:

1. **Open**: https://startup-apnedoctors.vercel.app
2. **Try**: Clinical assessment flow
3. **Test**: Voice AI conversations
4. **Monitor**: Emergency workflows
5. **Analyze**: Medical reports

Your complete AI-powered healthcare platform is ready! 🚀

---

## 📞 Support

**Need help?**
- Check `status-check.bat` for diagnostics
- Review logs in each service
- Test individual components
- Check this guide for common issues

**Emergency contact**: Check emergency workflow in n8n for critical alerts.