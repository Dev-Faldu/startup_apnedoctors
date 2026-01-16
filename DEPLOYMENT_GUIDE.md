# ApneDoctors - Deployment Guide

## 📋 Table of Contents
1. [Vercel Deployment](#vercel-deployment)
2. [Render Deployment](#render-deployment)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment](#post-deployment)

---

## 🚀 Vercel Deployment

### Prerequisites
- GitHub account with your project repository
- Vercel account (free at https://vercel.com)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**
   - Connect your GitHub account
   - Select your `apnedoctors-ai` repository
   - Click **"Import"**

4. **Configure Project**
   - Framework Preset: Select **"Vite"** (or it auto-detects)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add all variables from your `.env.local` file:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     VITE_OPENAI_API_KEY=your_openai_key (if needed)
     ```

6. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete
   - Get your live URL (e.g., `https://apnedoctors.vercel.app`)

### Vercel Deployment Notes
- ✅ Auto-deploys on every push to main
- ✅ Automatic SSL/HTTPS
- ✅ CDN included
- ✅ Free tier supports production deployments
- ✅ Preview deployments for each PR

---

## 🚀 Render Deployment

### For Frontend (Alternative to Vercel)

#### Prerequisites
- GitHub account
- Render account (free at https://render.com)

#### Step 1: Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository**
   - Select **"Build and deploy from a Git repository"**
   - Connect GitHub if needed
   - Select your `apnedoctors-ai` repository

4. **Configure Service**
   - **Name**: `apnedoctors`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview` (for static serving, use a proper server) 
     *Note: For static files, you may need to use a different approach*
   - **Branch**: `main`

5. **Add Environment Variables**
   - Go to **"Environment"** section
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     NODE_ENV=production
     ```

### For Backend Services (If Using Render)
If you have backend services in your Supabase functions, consider:

```yaml
# Create a render.yaml file in root for multi-service deployment
services:
  - type: web
    name: apnedoctors
    env: node
    buildCommand: npm run build
    startCommand: npm run preview
    envVars:
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
```

---

## 📦 Environment Variables

### Create `.env.production` file:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-key (if applicable)
```

### Where to Find These:
1. **Supabase Variables**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **API**
   - Copy `Project URL` and `anon public key`

2. **OpenAI API Key (if needed)**
   - Go to [OpenAI Platform](https://platform.openai.com)
   - Settings → API keys
   - Create new secret key

---

## ✅ Post-Deployment Checklist

### After Deploying to Vercel:
- [ ] Test the live URL in browser
- [ ] Verify auth flows work (Login/Signup)
- [ ] Test Supabase connections
- [ ] Check WebSocket connections for Live AI
- [ ] Test camera/microphone permissions
- [ ] Verify CORS settings in Supabase

### Update Your Project:
1. **Update Supabase CORS**:
   - Supabase Dashboard → Settings → API
   - Add your Vercel domain to allowed origins:
     ```
     https://apnedoctors.vercel.app
     https://*.vercel.app
     ```

2. **Update External Service URLs**:
   - If you have external voice backends, update their allowed domains
   - Update any hardcoded URLs to production URLs

3. **Enable Production Features**:
   - Database backups
   - SSL/TLS enforcement
   - Rate limiting in production

### Post-Deployment Monitoring:
```bash
# View Vercel logs
vercel logs

# View Render logs
# Use Render dashboard Live Tail
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Use `.gitignore`
2. **Rotate keys periodically** - Change API keys every 90 days
3. **Enable 2FA** - On both Vercel and Render accounts
4. **Use environment-specific secrets** - Different keys for dev/prod
5. **Monitor usage** - Track API calls and costs

---

## 🛠️ Troubleshooting

### Build Fails on Vercel:
```bash
# Clear cache and rebuild
npm cache clean --force
npm install
npm run build
```

### CORS Issues:
- Add deployment domain to Supabase allowed origins
- Check API endpoint configurations

### Environment Variables Not Loading:
- Verify variable names start with `VITE_` (for Vite client-side)
- Redeploy after adding new variables

### WebSocket Connection Issues:
- Ensure Supabase Real-time is enabled
- Check network tab in browser DevTools

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev

---

## 🚀 Quick Deploy Summary

| Platform | Steps | Time | Cost |
|----------|-------|------|------|
| **Vercel** | 5 | ~2 min | Free |
| **Render** | 6 | ~3 min | Free |

**Recommended**: Use **Vercel** for frontend - it's optimized for Vite/React apps.

---
