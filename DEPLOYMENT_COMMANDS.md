# 🚀 Complete Deployment Commands

Copy-paste ready commands for both platforms!

---

## 🔧 Local Setup Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check for errors
npm run lint

# Clean cache and reinstall (if having issues)
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Vercel Deployment

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Check deployment status
vercel status

# View logs
vercel logs
```

### Option B: Using Git (Recommended)

```bash
# Push to GitHub (Vercel auto-deploys)
git add .
git commit -m "Deploy to production"
git push origin main

# Then visit your Vercel dashboard to see auto-deployment
```

### Set Environment Variables in Vercel

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Then deploy to apply them
vercel --prod
```

---

## Render Deployment

### Option A: Using Git Push (Recommended)

```bash
# Push to GitHub (Render auto-deploys)
git add .
git commit -m "Deploy to Render"
git push origin main

# Then visit https://dashboard.render.com to create service
```

### Option B: Using Render CLI

```bash
# Install Render CLI (if available)
# Follow Render documentation for CLI setup

# Set environment variables
# Go to Render dashboard → Environment section
```

### Render Build & Start Commands

When configuring on Render dashboard, use:

```
Build Command:
npm install && npm run build

Start Command:
npm run preview
```

---

## GitHub Actions Setup

```bash
# Add secrets to GitHub repository
# Go to: Settings → Secrets and variables → Actions

# Add these secrets:
# VERCEL_TOKEN - Get from https://vercel.com/account/tokens
# VERCEL_ORG_ID - Get from Vercel dashboard
# VERCEL_PROJECT_ID - Get from Vercel dashboard
# VITE_SUPABASE_URL - Your Supabase URL
# VITE_SUPABASE_ANON_KEY - Your Supabase key

# Then any push to main triggers auto-deployment
git add .
git commit -m "Trigger CI/CD"
git push origin main
```

---

## Environment Variables Setup

### Create .env.local (Local Development)

```bash
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF
```

### Supabase Credentials Command

```bash
# Get Supabase credentials via CLI
supabase link --project-ref your-project-ref
supabase projects list

# Or manually from:
# https://app.supabase.com → Settings → API
```

---

## Troubleshooting Commands

```bash
# Check Node version (should be 16+)
node --version

# Check npm version
npm --version

# Verify build configuration
cat vite.config.ts

# Test build in production mode
npm run build:dev

# Check TypeScript errors
npx tsc --noEmit

# Audit dependencies
npm audit

# Check for outdated packages
npm outdated

# Update packages
npm update
```

---

## Deployment Verification Commands

```bash
# After deployment, verify app loads
curl -I https://your-deployed-app.com

# Check if HTTPS is working
curl -I https://your-deployed-app.com

# Test API endpoint
curl https://your-deployed-app.com/api/health

# Monitor deployed logs
# Vercel: vercel logs
# Render: Visit dashboard → Logs
```

---

## Docker Commands (For Advanced Users)

```bash
# Build Docker image
docker build -t apnedoctors .

# Run Docker container locally
docker run -p 3000:3000 apnedoctors

# Push to Docker Hub
docker tag apnedoctors your-username/apnedoctors
docker push your-username/apnedoctors
```

---

## Git Commands for Deployment

```bash
# View deployment-related commits
git log --oneline -5

# Create deployment branch
git checkout -b deploy/vercel

# Merge to main to trigger deployment
git checkout main
git merge deploy/vercel
git push origin main

# Rollback if needed
git revert HEAD
git push origin main

# View git status
git status

# View remote URLs
git remote -v

# Set deployment branch
git branch -u origin/main
```

---

## Database Commands (Supabase)

```bash
# Run migrations (if using Supabase CLI)
supabase migration list

# Apply migrations
supabase db push

# Reset database
supabase db reset
```

---

## Performance Monitoring Commands

```bash
# Check build size
npm run build
# Look at dist/ folder size

# Analyze bundle size
npm install -g webpack-bundle-analyzer
# Add webpack-bundle-analyzer to your build

# Test performance locally
npm run preview
# Then run Lighthouse audit in Chrome DevTools (F12)
```

---

## Security Commands

```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update all dependencies safely
npm update

# Check for outdated packages
npm outdated

# Regenerate package lock file
npm ci

# Check git history for secrets
git log -p | grep -i "password\|token\|secret"
```

---

## Deployment Checklist (One-Liner)

```bash
# Complete pre-deployment check
npm install && npm run lint && npm run build && echo "✅ Ready for deployment!"
```

---

## Deploy to Vercel (One-Liner)

```bash
# Complete Vercel deployment
git add . && git commit -m "Deploy to Vercel" && git push origin main && echo "🚀 Deployment triggered! Check Vercel dashboard."
```

---

## Deploy to Render (One-Liner)

```bash
# Complete Render deployment
git add . && git commit -m "Deploy to Render" && git push origin main && echo "🚀 Deployment triggered! Check Render dashboard."
```

---

## Deploy to Both (One-Liner)

```bash
# Deploy to both platforms simultaneously
git add . && git commit -m "Deploy to Vercel & Render" && git push origin main && echo "🚀 Deployment triggered on both platforms!"
```

---

## Windows-Specific Commands

```powershell
# PowerShell - Build
npm run build

# PowerShell - Deploy to Vercel
npm install -g vercel; vercel --prod

# PowerShell - View Vercel logs
vercel logs

# PowerShell - Deploy via Git
git add .; git commit -m "Deploy"; git push origin main
```

---

## Mac/Linux-Specific Commands

```bash
# Bash - Build
npm run build

# Bash - Deploy to Vercel
npm install -g vercel && vercel --prod

# Bash - View Vercel logs
vercel logs

# Bash - Deploy via Git
git add . && git commit -m "Deploy" && git push origin main

# Make deploy script executable
chmod +x deploy.sh
./deploy.sh
```

---

## Post-Deployment Health Check

```bash
#!/bin/bash

echo "🏥 Post-Deployment Health Check"
echo "================================"

# Check if app is up
if curl -s -o /dev/null -w "%{http_code}" $1 | grep -q "200"; then
  echo "✅ App is responding (HTTP 200)"
else
  echo "❌ App is not responding"
fi

# Check build artifacts
if [ -d "dist" ]; then
  echo "✅ Build artifacts found ($(du -sh dist | cut -f1))"
else
  echo "❌ Build artifacts missing"
fi

# Check dependencies
echo "✅ Dependencies: $(npm ls | wc -l) packages"

echo ""
echo "Health check complete!"
```

---

## Save This for Reference

```bash
# Copy all commands to a file
cat > DEPLOYMENT_COMMANDS.md > deployment-commands.txt

# Print all commands
cat DEPLOYMENT_COMMANDS.md

# Search for specific command
grep "vercel" DEPLOYMENT_COMMANDS.md
```

---

## Quick Reference Table

| Task | Command |
|------|---------|
| Install | `npm install` |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Deploy (Vercel CLI) | `vercel --prod` |
| Deploy (Git) | `git push origin main` |
| Check Vercel logs | `vercel logs` |
| Update env vars | Edit in dashboard, then redeploy |
| Rollback | `git revert HEAD && git push` |

---

## Emergency Commands

```bash
# If deployment is stuck
npm cache clean --force

# If build fails
rm -rf node_modules package-lock.json && npm install

# If env vars aren't loading
# Redeploy after adding them in dashboard

# If CORS errors
# Add domain to Supabase CORS settings

# If nothing works
# Start fresh: git status && git log
```

---

## Success Indicators

```bash
# Your app is successfully deployed when:

# ✅ Can access at deployment URL
curl https://your-app-url.com

# ✅ Environment variables are loaded
# Check browser console, should see app load without CORS errors

# ✅ API calls work
# Try login/signup or any API call

# ✅ No errors in deployment logs
# Check platform dashboard logs

# ✅ App is responsive
# Test on mobile device
```

---

## Keep This Handy!

These commands are your deployment toolkit. Bookmark this file! 📌

**Last updated:** January 16, 2026
**For:** ApneDoctors Project
**Status:** Ready to Deploy ✅
