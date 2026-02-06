#!/bin/bash

# ApneDoctors N8N Setup Script
echo "🚀 Setting up N8N for ApneDoctors..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create n8n directory
mkdir -p n8n-data

# Run N8N with Docker
docker run -d \
  --name apnedoctors-n8n \
  -p 5678:5678 \
  -v $(pwd)/n8n-data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=apnedoctors2024 \
  n8nio/n8n:latest

echo "✅ N8N is starting up..."
echo ""
echo "📋 Access Information:"
echo "URL: http://localhost:5678"
echo "Username: admin"
echo "Password: apnedoctors2024"
echo ""
echo "📚 Next Steps:"
echo "1. Open http://localhost:5678 in your browser"
echo "2. Import workflows from docs/n8n-workflows/"
echo "3. Configure webhook URLs in MedicalAIService.ts"
echo "4. Set up credentials (SMTP, Twilio, Supabase, etc.)"
echo ""
echo "🛑 To stop N8N: docker stop apnedoctors-n8n"
echo "🗑️  To remove: docker rm apnedoctors-n8n"