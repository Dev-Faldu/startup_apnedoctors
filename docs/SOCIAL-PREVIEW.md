# Social Preview (Link Thumbnail) - ApneDoctors

## What was fixed

- **Share thumbnail** now uses your ApneDoctors logo instead of Lovable branding.
- **Open Graph** and **Twitter Card** meta tags point to:
  - Image: `https://startup-apnedoctors.vercel.app/logo_apnedoctors.png`
  - Title: ApneDoctors - AI-Powered Remote Healthcare
  - URL: https://startup-apnedoctors.vercel.app/

## After you deploy

1. **Redeploy** your site (e.g. push to GitHub so Vercel deploys).
2. **Refresh link previews** (social platforms cache thumbnails):
   - **Facebook**: https://developers.facebook.com/tools/debug/  
     Enter `https://startup-apnedoctors.vercel.app/` and click “Scrape Again”.
   - **Twitter/X**: https://cards-dev.twitter.com/validator  
     Enter your URL and validate.
   - **LinkedIn**: https://www.linkedin.com/post-inspector/  
     Enter your URL and inspect.
3. **Use your own logo file** (optional):  
   Replace `public/logo_apnedoctors.png` with your ApneDoctors logo (the one with the stethoscope and “Apne Doctors” text). For best results use at least **1200×630 px** for the share image.

## Files that control the preview

- `index.html` – `og:image`, `og:title`, `og:description`, `twitter:image`, etc.
- `public/logo_apnedoctors.png` – image used as the share thumbnail.
