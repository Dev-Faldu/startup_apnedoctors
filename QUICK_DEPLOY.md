# 🚀 Quick Deployment Guide - ApneDoctors

## Summary of Files Created

✅ **vercel.json** - Vercel configuration
✅ **render.yaml** - Render configuration  
✅ **.env.example** - Environment variables template
✅ **DEPLOYMENT_GUIDE.md** - Complete deployment documentation
✅ **.github/workflows/deploy.yml** - GitHub Actions CI/CD
✅ **deploy.sh** - Deployment script (Mac/Linux)
✅ **deploy.bat** - Deployment script (Windows)

---

## 🎯 Quick Start (Choose One)

### Option 1: Deploy to Vercel (Recommended ✨)

**Best for:** Frontend React/Vite apps

#### Step-by-Step:
1. **Prepare your code:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Vercel:**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables:**
   - Go to "Settings" → "Environment Variables"
   - Add these secrets:
     ```
     VITE_SUPABASE_URL = your_supabase_url
     VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for completion (~2-3 minutes)
   - Get your live URL ✅

---

### Option 2: Deploy to Render

**Best for:** Full-stack applications or static hosting

#### Step-by-Step:
1. **Prepare repository:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Render:**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Select "Build and deploy from a Git repository"

3. **Configure:**
   - Connect GitHub account
   - Select repository
   - Settings:
     ```
     Build Command: npm install && npm run build
     Start Command: npm run preview
     ```

4. **Add Environment Variables:**
   - Go to "Environment"
   - Add:
     ```
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     NODE_ENV = production
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete (~3-5 minutes)

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] All code committed to GitHub
- [ ] Supabase project created and configured
- [ ] Supabase URL and Anon Key available
- [ ] `.env.local` file (NOT committed)
- [ ] `.env.example` file (committed - shows what vars are needed)
- [ ] No console errors when running `npm run build`
- [ ] No secrets hardcoded in source files

---

## 🔐 Getting Your Secrets

### Supabase URL & Key:
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public key** (VITE_SUPABASE_ANON_KEY)

### Don't Share These! 🔒
- Never commit .env.local
- Never share API keys
- Regenerate keys if accidentally exposed

---

## ✅ After Deployment

### Verify Everything Works:
1. [ ] Visit your deployed URL
2. [ ] Test login/signup
3. [ ] Test camera access (if used)
4. [ ] Test Supabase queries
5. [ ] Check browser console for errors
6. [ ] Test on mobile devices

### Update Supabase CORS:
1. Go to Supabase Settings → API
2. Add your deployment URL to allowed origins:
   ```
   https://yourapp.vercel.app
   https://*.vercel.app
   https://yourapp.onrender.com
   ```

---

## 🔧 Environment Variables Reference

| Variable | Where to Get | Required |
|----------|--------------|----------|
| VITE_SUPABASE_URL | Supabase Dashboard → API | ✅ Yes |
| VITE_SUPABASE_ANON_KEY | Supabase Dashboard → API | ✅ Yes |
| VITE_OPENAI_API_KEY | OpenAI Platform (if needed) | ❌ Optional |
| NODE_ENV | Set to "production" | ✅ Yes |

---

## 🐛 Troubleshooting

### Build Fails?
```bash
# Clean and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment variables not working?
- Make sure variable names start with `VITE_` (for client-side)
- Redeploy after adding new variables
- Variables are injected at build time (not runtime)

### Page not loading?
- Check browser console (F12 → Console tab)
- Check deployment logs for build errors
- Verify CORS settings in Supabase

### CORS errors?
- Add deployment domain to Supabase allowed origins
- Restart your app after updating CORS

---

## 📚 Resource Links

| Resource | Link |
|----------|------|
| Vercel Docs | https://vercel.com/docs |
| Render Docs | https://render.com/docs |
| Supabase Docs | https://supabase.com/docs |
| Vite Docs | https://vitejs.dev |
| React Docs | https://react.dev |

---

## 💡 Pro Tips

1. **Use Vercel for speed** - Optimized for Vite, instant deploys
2. **Use Render for learning** - Good for understanding deployments
3. **Keep secrets safe** - Use environment variables always
4. **Monitor deployments** - Check logs regularly
5. **Test before deploying** - Run `npm run build` locally first

---

## 🎉 You're Ready!

Choose your platform and follow the steps above. Your app will be live in minutes!

**Questions?** Check DEPLOYMENT_GUIDE.md for detailed information.

---

**Happy Deploying! 🚀**
