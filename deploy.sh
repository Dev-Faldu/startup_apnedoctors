#!/bin/bash
# ApneDoctors Deployment Script
# This script helps you deploy to Vercel and Render

set -e

echo "🚀 ApneDoctors Deployment Helper"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
fi

echo "📋 Deployment Options:"
echo "1. Deploy to Vercel (Recommended)"
echo "2. Deploy to Render"
echo "3. Deploy to Both"
echo "4. Just build locally"
echo ""
read -p "Select option (1-4): " choice

# Function to build project
build_project() {
    echo "🔨 Building project..."
    npm run build
    echo "✅ Build complete! Output in ./dist"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo ""
    echo "🚀 Preparing Vercel deployment..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo ""
    echo "📝 Next steps for Vercel:"
    echo "1. Run: vercel"
    echo "2. Link to your Vercel project"
    echo "3. Add environment variables in Vercel dashboard:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "Ready to deploy? (y/n): "
    read -r proceed
    
    if [ "$proceed" = "y" ]; then
        vercel
    fi
}

# Function to deploy to Render
deploy_render() {
    echo ""
    echo "🚀 Preparing Render deployment..."
    echo ""
    echo "📝 Next steps for Render:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Use these settings:"
    echo "   - Build Command: npm install && npm run build"
    echo "   - Start Command: npm run preview"
    echo "5. Add environment variables:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "✅ Configuration file ready: render.yaml"
}

# Execute based on choice
case $choice in
    1)
        build_project
        deploy_vercel
        ;;
    2)
        build_project
        deploy_render
        ;;
    3)
        build_project
        deploy_vercel
        deploy_render
        ;;
    4)
        build_project
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
