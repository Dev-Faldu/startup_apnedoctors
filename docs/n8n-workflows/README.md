# ApneDoctors N8N Workflows

This directory contains pre-built n8n workflows for automating critical healthcare processes in the ApneDoctors platform.

## 🚀 Quick Start

1. **Install N8N:**
   ```bash
   ./n8n-setup.sh  # Linux/Mac
   # OR
   n8n-setup.bat   # Windows
   ```

2. **Access N8N:**
   - URL: http://localhost:5678
   - Username: `admin`
   - Password: `apnedoctors2024`

3. **Import Workflows:**
   - Click "Import from File" in n8n
   - Select the JSON files from this directory
   - Save and activate each workflow

4. **Configure Credentials:**
   - Set up SMTP for emails
   - Configure Twilio for SMS
   - Add Supabase credentials
   - Set Google Maps API key

## 📋 Available Workflows

### 1. Emergency Alert Workflow
**File:** `emergency-alert-workflow.json`
**Purpose:** Handle critical medical emergencies (RED triage)

**Flow:**
```
Webhook → Validate → Check Triage → Send Email/SMS → Log → Respond
```

**Triggers:** When patient assessment shows RED triage level
**Actions:**
- Sends email alert to nearest hospital
- Sends SMS to emergency services
- Logs incident for compliance
- Returns confirmation to frontend

**Required Credentials:**
- SMTP (Email sending)
- Twilio (SMS sending)

### 2. User Onboarding Workflow
**File:** `user-onboarding-workflow.json`
**Purpose:** Automate new user welcome and engagement

**Flow:**
```
Webhook → Welcome Email → Wait 1 Day → Reminder Email → Respond
```

**Triggers:** After successful user registration
**Actions:**
- Sends immediate welcome email
- Waits 24 hours
- Sends profile completion reminder
- Tracks engagement metrics

**Required Credentials:**
- SMTP (Email sending)

### 3. Medical Report Processing Workflow
**File:** `medical-report-processing-workflow.json`
**Purpose:** Process and distribute medical reports

**Flow:**
```
Webhook → Prepare Data → Notify Patient → Respond
```

**Triggers:** After AI analysis completes
**Actions:**
- Formats clinical data
- Sends report ready notification
- Prepares for doctor review routing

**Required Credentials:**
- SMTP (Email sending)
- Supabase (Database access)

## 🔧 Workflow Configuration

### Environment Variables
Set these in your n8n environment:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_FROM=+1234567890

# Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### Webhook URLs
Update these URLs in `MedicalAIService.ts`:

```typescript
const N8N_WEBHOOKS = {
  emergencyAlert: "http://localhost:5678/webhook/emergency-alert",
  userOnboarding: "http://localhost:5678/webhook/user-onboarding",
  reportProcessing: "http://localhost:5678/webhook/report-processing"
};
```

## 🧪 Testing Workflows

### Emergency Alert Test
```bash
curl -X POST http://localhost:5678/webhook/emergency-alert \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "test-123",
    "symptoms": "Severe chest pain",
    "triageLevel": "RED",
    "location": "40.7128,-74.0060",
    "contactInfo": "+1234567890"
  }'
```

### User Onboarding Test
```bash
curl -X POST http://localhost:5678/webhook/user-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "email": "test@example.com",
    "name": "John Doe",
    "signupSource": "web_app"
  }'
```

### Report Processing Test
```bash
curl -X POST http://localhost:5678/webhook/report-processing \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "report-123",
    "patientData": {
      "email": "patient@example.com",
      "name": "Jane Smith"
    },
    "clinicalFindings": {
      "summary": "Normal assessment"
    },
    "recommendations": ["Follow up in 1 week"]
  }'
```

## 🚀 Production Deployment

### 1. Cloud Hosting
- **Railway:** `railway up`
- **Render:** Connect GitHub repo
- **AWS/GCP:** Use Docker containers

### 2. Domain Configuration
- Update webhook URLs in frontend
- Configure SSL certificates
- Set up monitoring

### 3. Scaling
- Multiple n8n instances behind load balancer
- Redis for job queuing
- Database clustering for high availability

## 🔒 Security Best Practices

### HIPAA Compliance
- Encrypt PHI data in transit and at rest
- Implement audit logging
- Regular security assessments
- Access control and authentication

### Webhook Security
- Use HTTPS only
- Implement webhook signatures
- Rate limiting and abuse prevention
- Input validation and sanitization

## 📊 Monitoring & Analytics

### Built-in Monitoring
- Workflow execution logs
- Success/failure rates
- Performance metrics
- Error tracking

### Custom Dashboards
- Patient engagement metrics
- Emergency response times
- Workflow efficiency
- System health monitoring

## 🆘 Troubleshooting

### Common Issues

**Workflow not triggering:**
- Check webhook URL is correct
- Verify n8n is running
- Check workflow is active

**Email/SMS not sending:**
- Verify credentials are configured
- Check SMTP/Twilio settings
- Review n8n logs

**Database connection failed:**
- Confirm Supabase credentials
- Check network connectivity
- Verify table permissions

### Debug Mode
Enable debug logging in n8n:
```bash
export N8N_LOG_LEVEL=debug
export N8N_LOG_OUTPUT=console
```

## 📚 Additional Resources

- [N8N Documentation](https://docs.n8n.io/)
- [Healthcare Automation Examples](https://n8n.io/workflows/)
- [Webhook Security Guide](https://docs.n8n.io/integrations/webhooks/)
- [Production Deployment Guide](https://docs.n8n.io/hosting/)

## 🎯 Next Steps

1. Import and test all workflows
2. Configure production credentials
3. Set up monitoring and alerts
4. Create custom workflows for your specific needs
5. Integrate with additional healthcare systems

---

**Need help?** Check the [N8N Integration Guide](../N8N_INTEGRATION_GUIDE.md) for comprehensive documentation.