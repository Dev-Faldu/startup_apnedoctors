import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ============= Constants =============
export const MAX_TEXT_LENGTH = 2000;
export const MAX_SYMPTOMS_LENGTH = 1000;
export const MAX_ADDITIONAL_INFO_LENGTH = 500;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB base64
export const MAX_CONVERSATION_HISTORY = 50;
export const MAX_MESSAGE_LENGTH = 1000;

// ============= Sanitization Helpers =============
export function sanitizeText(text: string | undefined | null, maxLength: number = MAX_TEXT_LENGTH): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = text.replace(
    // eslint-disable-next-line no-control-regex -- intentional: strip control chars for security
    /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,
    ''
  );
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

export function sanitizeImageBase64(imageBase64: string | undefined | null): string | null {
  if (!imageBase64 || typeof imageBase64 !== 'string') return null;
  
  // Check size limit
  if (imageBase64.length > MAX_IMAGE_SIZE) {
    throw new Error(`Image too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  }
  
  // Validate it's a proper data URL or base64
  const isDataUrl = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(imageBase64);
  const isBase64 = /^[A-Za-z0-9+/=]+$/.test(imageBase64.replace(/^data:image\/\w+;base64,/, ''));
  
  if (!isDataUrl && !isBase64) {
    throw new Error('Invalid image format. Must be base64 encoded image.');
  }
  
  return imageBase64;
}

export function sanitizeUUID(uuid: string | undefined | null): string | null {
  if (!uuid || typeof uuid !== 'string') return null;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return null;
  }
  
  return uuid.toLowerCase();
}

// ============= Zod Schemas =============

// ai-triage schema
export const triageInputSchema = z.object({
  symptoms: z.string().max(MAX_SYMPTOMS_LENGTH).optional().transform(val => sanitizeText(val, MAX_SYMPTOMS_LENGTH)),
  painLevel: z.number().min(0).max(10).optional().nullable(),
  duration: z.string().max(100).optional().transform(val => sanitizeText(val, 100)),
  location: z.string().max(200).optional().transform(val => sanitizeText(val, 200)),
  additionalInfo: z.string().max(MAX_ADDITIONAL_INFO_LENGTH).optional().transform(val => sanitizeText(val, MAX_ADDITIONAL_INFO_LENGTH)),
});

// ai-vision-analysis schema
export const visionAnalysisInputSchema = z.object({
  imageBase64: z.string().optional(),
  bodyPart: z.string().max(100).optional().transform(val => sanitizeText(val, 100)),
  additionalContext: z.string().max(MAX_ADDITIONAL_INFO_LENGTH).optional().transform(val => sanitizeText(val, MAX_ADDITIONAL_INFO_LENGTH)),
});

// ai-object-detection and ai-pose-analysis schema
export const objectDetectionInputSchema = z.object({
  image: z.string(),
  sessionId: z.string().uuid().optional().nullable(),
  analysisType: z.string().max(100).optional().transform(val => sanitizeText(val, 100)),
});

// ai-symptom-analysis schema
export const symptomAnalysisInputSchema = z.object({
  symptoms: z.string().min(1, "Symptoms are required").max(MAX_SYMPTOMS_LENGTH).transform(val => sanitizeText(val, MAX_SYMPTOMS_LENGTH)),
  painLevel: z.number().min(0).max(10).optional().nullable(),
  duration: z.string().max(100).optional().transform(val => sanitizeText(val, 100)),
  bodyPart: z.string().max(200).optional().transform(val => sanitizeText(val, 200)),
  additionalInfo: z.string().max(MAX_ADDITIONAL_INFO_LENGTH).optional().transform(val => sanitizeText(val, MAX_ADDITIONAL_INFO_LENGTH)),
  patientHistory: z.string().max(MAX_TEXT_LENGTH).optional().transform(val => sanitizeText(val, MAX_TEXT_LENGTH)),
});

// ai-emergency-check schema
export const emergencyCheckInputSchema = z.object({
  text: z.string().max(MAX_TEXT_LENGTH).optional().transform(val => sanitizeText(val, MAX_TEXT_LENGTH)),
  symptoms: z.union([
    z.string().max(MAX_SYMPTOMS_LENGTH).transform(val => sanitizeText(val, MAX_SYMPTOMS_LENGTH)),
    z.array(z.string().max(200)).max(20).transform(arr => arr.map(s => sanitizeText(s, 200)))
  ]).optional(),
});

// Conversation message schema
const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(MAX_MESSAGE_LENGTH).transform(val => sanitizeText(val, MAX_MESSAGE_LENGTH)),
});

// ai-live-triage schema
export const liveTriageInputSchema = z.object({
  transcript: z.string().max(MAX_MESSAGE_LENGTH).optional().transform(val => sanitizeText(val, MAX_MESSAGE_LENGTH)),
  conversationHistory: z.array(conversationMessageSchema).max(MAX_CONVERSATION_HISTORY).default([]),
  imageAnalysis: z.unknown().optional(),
  sessionId: z.string().uuid().optional().nullable(),
});

// ai-realtime-triage schema
export const realtimeTriageInputSchema = z.object({
  conversationHistory: z.array(conversationMessageSchema).max(MAX_CONVERSATION_HISTORY).optional().default([]),
  currentMessage: z.string().max(MAX_MESSAGE_LENGTH).transform(val => sanitizeText(val, MAX_MESSAGE_LENGTH)),
  visionContext: z.record(z.unknown()).optional(),
  sessionId: z.string().uuid().optional().nullable(),
});

// ai-comprehensive-report schema
export const comprehensiveReportInputSchema = z.object({
  patientInfo: z.record(z.unknown()).optional(),
  symptomAnalysis: z.record(z.unknown()).optional(),
  visionAnalysis: z.record(z.unknown()).optional(),
  poseAnalysis: z.record(z.unknown()).optional(),
  sessionId: z.string().uuid().optional().nullable(),
  assessmentId: z.string().uuid().optional().nullable(),
});

// ai-live-vision schema
export const liveVisionInputSchema = z.object({
  imageBase64: z.string(),
  sessionId: z.string().uuid().optional().nullable(),
});

// medical-report schema
export const medicalReportInputSchema = z.object({
  triageData: z.record(z.unknown()).optional(),
  visionData: z.record(z.unknown()).optional(),
  patientInfo: z.record(z.unknown()).optional(),
});

// platform-stats schema (no input needed)
export const platformStatsInputSchema = z.object({}).optional();

// ============= Validation Helper =============
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return { success: false, error: `Validation failed: ${messages}` };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

// ============= Response Helper =============
export function validationErrorResponse(error: string, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ 
      error: 'Invalid input',
      details: error,
      disclaimer: 'Please check your input and try again.'
    }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
