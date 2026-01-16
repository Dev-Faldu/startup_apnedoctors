# 📋 Deployment Checklist

## Pre-Deployment

- [ ] **Code is ready**
  - [ ] No console errors in dev
  - [ ] All files committed to Git
  - [ ] Main branch is clean

- [ ] **Supabase is configured**
  - [ ] Project created
  - [ ] URL and Anon Key available
  - [ ] Database migrations run
  - [ ] Auth configured

- [ ] **Secrets prepared**
  - [ ] `.env.local` NOT committed to Git
  - [ ] `.env.example` file exists with variable names
  - [ ] All secrets are secure (not in code)

- [ ] **Build works locally**
  - [ ] `npm install` succeeds
  - [ ] `npm run build` succeeds
  - [ ] No build errors or warnings

---

## Vercel Deployment Checklist

### Account Setup
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub account connected to Vercel
- [ ] Repository pushed to GitHub

### Project Configuration
- [ ] Repository selected in Vercel dashboard
- [ ] Framework preset: **Vite**
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### Environment Variables
- [ ] VITE_SUPABASE_URL added
- [ ] VITE_SUPABASE_ANON_KEY added
- [ ] Any other required vars added

### Deployment
- [ ] Clicked "Deploy" button
- [ ] Build completed successfully
- [ ] Live URL accessible
- [ ] App loads without errors

### Post-Deployment
- [ ] [ ] Login/Signup works
- [ ] [ ] Supabase queries work
- [ ] [ ] WebSockets connect (if used)
- [ ] [ ] Camera/Microphone access works (if used)
- [ ] [ ] No 404 errors for assets

### Supabase Configuration
- [ ] Added Vercel domain to CORS allowed origins
  ```
  https://your-app.vercel.app
  https://*.vercel.app
  ```
- [ ] Database URLs updated if hardcoded
- [ ] External service URLs updated

---

## Render Deployment Checklist

### Account Setup
- [ ] Render account created (https://render.com)
- [ ] GitHub account connected to Render
- [ ] Repository pushed to GitHub

### Service Configuration
- [ ] Service type: **Web Service**
- [ ] Repository selected
- [ ] Branch: `main`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm run preview`

### Environment Variables
- [ ] VITE_SUPABASE_URL added
- [ ] VITE_SUPABASE_ANON_KEY added
- [ ] NODE_ENV = production
- [ ] Any other required vars added

### Deployment
- [ ] Service created
- [ ] Build started automatically
- [ ] Build completed successfully
- [ ] Live URL accessible
- [ ] App loads without errors

### Post-Deployment
- [ ] [ ] Login/Signup works
- [ ] [ ] Supabase queries work
- [ ] [ ] WebSockets connect (if used)
- [ ] [ ] Camera/Microphone access works (if used)
- [ ] [ ] No 404 errors for assets

### Supabase Configuration
- [ ] Added Render domain to CORS allowed origins
  ```
  https://your-app.onrender.com
  ```
- [ ] Database URLs updated if hardcoded
- [ ] External service URLs updated

---

## Both Platforms - General Checks

### Browser Testing
- [ ] App loads on Chrome
- [ ] App loads on Firefox
- [ ] App loads on Safari
- [ ] App loads on mobile browsers
- [ ] No console errors (F12 → Console)

### Functionality Testing
- [ ] All main features work
- [ ] Forms submit successfully
- [ ] API calls complete without errors
- [ ] Loading states display properly
- [ ] Error states display properly

### Performance
- [ ] Page loads quickly (< 3s)
- [ ] No large unoptimized images
- [ ] CSS is minified
- [ ] JavaScript is minified
- [ ] No console warnings

### Security
- [ ] No secrets visible in page source
- [ ] No sensitive data in localStorage
- [ ] HTTPS is enforced
- [ ] CORS headers are correct
- [ ] CSP headers are configured (if needed)

---

## Rollback Plan

If deployment has issues:

### Vercel Rollback
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments"
4. Find previous working deployment
5. Click "Promote to Production"

### Render Rollback
1. Go to Render Dashboard
2. Select your service
3. Go to "Deployment"
4. Find previous working deployment
5. Click "Deploy" or update Git branch

---

## Maintenance Checklist

### Weekly
- [ ] Check deployment logs
- [ ] Verify app is still running
- [ ] Monitor error rates

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review API usage and costs
- [ ] Back up database

### Quarterly
- [ ] Rotate API keys
- [ ] Review and update CORS origins
- [ ] Optimize database indexes
- [ ] Update Node.js version if needed

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm run build` locally to debug |
| Env vars not loading | Redeploy after adding variables |
| 404 errors | Check output directory is `dist` |
| CORS errors | Add domain to Supabase CORS |
| App won't load | Check browser console, check build logs |
| API calls fail | Check Supabase connection, verify CORS |

---

## Success! 🎉

When everything is checked off:
- Your app is live in production ✅
- Users can access it from anywhere ✅
- It's automatically updated on each Git push ✅
- Your app is ready to scale ✅

**Congratulations on your deployment!** 🚀
