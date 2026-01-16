@echo off
REM ApneDoctors Deployment Script for Windows
REM This script helps you deploy to Vercel and Render

echo.
echo 🚀 ApneDoctors Deployment Helper
echo ==================================
echo.

REM Check if git is initialized
if not exist .git (
    echo ❌ Git repository not found. Initializing...
    git init
    git add .
    git commit -m "Initial commit"
    echo ✅ Git repository initialized
)

echo 📋 Deployment Options:
echo 1. Deploy to Vercel (Recommended)
echo 2. Deploy to Render
echo 3. Deploy to Both
echo 4. Just build locally
echo.

set /p choice="Select option (1-4): "

REM Function to build project
if "%choice%"=="1" goto build_and_vercel
if "%choice%"=="2" goto build_and_render
if "%choice%"=="3" goto build_and_both
if "%choice%"=="4" goto build_only

echo ❌ Invalid option
goto end

:build_only
echo.
echo 🔨 Building project...
call npm run build
echo ✅ Build complete! Output in .\dist
goto end

:build_and_vercel
echo.
echo 🔨 Building project...
call npm run build
echo ✅ Build complete! Output in .\dist
echo.
echo 🚀 Preparing Vercel deployment...
echo.
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel
)
echo.
echo 📝 Next steps for Vercel:
echo 1. Run: vercel
echo 2. Link to your Vercel project
echo 3. Add environment variables in Vercel dashboard:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo.
set /p proceed="Ready to deploy? (y/n): "
if "%proceed%"=="y" call vercel
goto end

:build_and_render
echo.
echo 🔨 Building project...
call npm run build
echo ✅ Build complete! Output in .\dist
echo.
echo 🚀 Preparing Render deployment...
echo.
echo 📝 Next steps for Render:
echo 1. Go to https://dashboard.render.com
echo 2. Click 'New +' ^> 'Web Service'
echo 3. Connect your GitHub repository
echo 4. Use these settings:
echo    - Build Command: npm install ^&^& npm run build
echo    - Start Command: npm run preview
echo 5. Add environment variables:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo.
echo ✅ Configuration file ready: render.yaml
goto end

:build_and_both
echo.
echo 🔨 Building project...
call npm run build
echo ✅ Build complete! Output in .\dist
echo.
echo 🚀 Preparing Vercel deployment...
echo.
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel
)
echo.
set /p proceed="Deploy to Vercel now? (y/n): "
if "%proceed%"=="y" call vercel
echo.
echo 🚀 Preparing Render deployment...
echo.
echo 📝 Next steps for Render:
echo 1. Go to https://dashboard.render.com
echo 2. Click 'New +' ^> 'Web Service'
echo 3. Connect your GitHub repository
echo 4. Use these settings:
echo    - Build Command: npm install ^&^& npm run build
echo    - Start Command: npm run preview
echo 5. Add environment variables:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo.
echo ✅ Configuration file ready: render.yaml
goto end

:end
echo.
echo ✅ Setup complete!
echo.
echo 📚 For detailed instructions, see DEPLOYMENT_GUIDE.md
