// N8N Integration Examples for ApneDoctors Frontend
// Copy these examples to integrate n8n workflows into your React components

import { MedicalAIService } from '@/services/MedicalAIService';

// ===========================================
// 1. USER ONBOARDING INTEGRATION
// ===========================================

// In your AuthContext.tsx - after successful user signup
export async function handleUserSignup(userData: {
  id: string;
  email: string;
  user_metadata: { full_name: string };
}) {
  try {
    // Trigger n8n user onboarding workflow
    const onboardingResult = await MedicalAIService.triggerUserOnboarding({
      userId: userData.id,
      email: userData.email,
      name: userData.user_metadata.full_name,
      signupSource: 'web_app'
    });

    console.log('User onboarding workflow started:', onboardingResult);
  } catch (error) {
    console.error('Failed to start user onboarding:', error);
    // Fallback: send basic welcome email directly
  }
}

// ===========================================
// 2. EMERGENCY ALERT INTEGRATION
// ===========================================

// In your ClinicalAssessment.tsx - when triage level is RED
export async function handleEmergencyAlert(assessmentData: {
  patientId: string;
  symptoms: string;
  triageLevel: string;
  location?: string;
  contactInfo: string;
}) {
  try {
    // Only trigger for RED triage (critical emergencies)
    if (assessmentData.triageLevel === 'RED') {
      const alertResult = await MedicalAIService.sendEmergencyAlert({
        patientId: assessmentData.patientId,
        symptoms: assessmentData.symptoms,
        triageLevel: assessmentData.triageLevel,
        location: assessmentData.location || 'Unknown',
        contactInfo: assessmentData.contactInfo
      });

      console.log('Emergency alert sent:', alertResult.alertId);
      return alertResult;
    }
  } catch (error) {
    console.error('Emergency alert failed:', error);
    // Critical: Show user that emergency services may be delayed
    alert('Emergency services notification failed. Please call emergency services directly.');
  }
}

// ===========================================
// 3. MEDICAL REPORT PROCESSING INTEGRATION
// ===========================================

// In your assessment completion flow
export async function processMedicalReport(reportData: {
  reportId: string;
  patientData: {
    id: string;
    email: string;
    name: string;
  };
  clinicalFindings: Record<string, unknown>;
  recommendations: unknown;
  doctorReview?: boolean;
}) {
  try {
    const processingResult = await MedicalAIService.processMedicalReport({
      reportId: reportData.reportId,
      patientData: reportData.patientData,
      clinicalFindings: reportData.clinicalFindings,
      recommendations: reportData.recommendations,
      doctorReview: reportData.doctorReview
    });

    console.log('Report processing completed:', processingResult);
    return processingResult;
  } catch (error) {
    console.error('Report processing failed:', error);
    // Fallback: Store report locally and notify manually
  }
}

// ===========================================
// 4. INTEGRATION IN REACT COMPONENTS
// ===========================================

// Example: AuthContext.tsx integration
/*
import { MedicalAIService } from '@/services/MedicalAIService';

export function AuthProvider({ children }: { children: ReactNode }) {
  // ... existing auth setup ...

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName || '' },
        },
      });

      if (error) throw error;

      // Trigger n8n onboarding workflow
      if (data.user) {
        await MedicalAIService.triggerUserOnboarding({
          userId: data.user.id,
          email: data.user.email!,
          name: fullName || 'User',
          signupSource: 'web_app'
        });
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // ... rest of component ...
}
*/

// Example: ClinicalAssessment.tsx emergency integration
/*
import { MedicalAIService } from '@/services/MedicalAIService';

export default function ClinicalAssessment() {
  // ... existing assessment logic ...

  const submitForTriage = async () => {
    try {
      const result = await MedicalAIService.analyzeSymptoms({
        symptoms: state.intakeData.symptoms,
        painLevel: state.intakeData.painLevel,
        duration: state.intakeData.duration,
        bodyPart: state.intakeData.bodyLocation,
        additionalInfo: state.intakeData.additionalInfo
      });

      // Check for emergency and trigger alert
      if (result.triageColor === 'RED') {
        await MedicalAIService.sendEmergencyAlert({
          patientId: user?.id || 'anonymous',
          symptoms: state.intakeData.symptoms,
          triageLevel: 'RED',
          location: user?.location,
          contactInfo: user?.phone || 'unknown'
        });
      }

      // ... continue with normal flow ...
    } catch (error) {
      console.error('Assessment failed:', error);
    }
  };

  // ... rest of component ...
}
*/

// ===========================================
// 5. ERROR HANDLING & FALLBACKS
// ===========================================

export async function safeN8nCall<T>(
  n8nFunction: () => Promise<T>,
  fallbackFunction?: () => Promise<T>,
  errorMessage = 'N8N workflow failed'
): Promise<T | null> {
  try {
    return await n8nFunction();
  } catch (error) {
    console.error(`${errorMessage}:`, error);

    // Try fallback if provided
    if (fallbackFunction) {
      try {
        console.log('Attempting fallback...');
        return await fallbackFunction();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return null;
  }
}

// Usage example:
/*
const result = await safeN8nCall(
  () => MedicalAIService.sendEmergencyAlert(alertData),
  () => sendEmergencyEmailDirectly(alertData), // fallback function
  'Emergency alert workflow failed'
);
*/

// ===========================================
// 6. CONFIGURATION
// ===========================================

// Environment-based webhook configuration
export const N8N_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? process.env.N8N_PRODUCTION_URL
    : 'http://localhost:5678',

  webhooks: {
    userOnboarding: '/webhook/user-onboarding',
    emergencyAlert: '/webhook/emergency-alert',
    reportProcessing: '/webhook/report-processing',
    appointmentScheduling: '/webhook/appointment-booking',
    paymentProcessing: '/webhook/payment-webhook'
  }
};

// Full webhook URLs
export const getWebhookUrl = (webhookName: keyof typeof N8N_CONFIG.webhooks): string => {
  return `${N8N_CONFIG.baseUrl}${N8N_CONFIG.webhooks[webhookName]}`;
};