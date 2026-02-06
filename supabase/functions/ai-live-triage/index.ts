import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { liveTriageInputSchema, validateInput, validationErrorResponse, sanitizeText } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LIVE_TRIAGE_PROMPT = `You are an AI Medical Triage Assistant conducting a live voice consultation. You are NOT a doctor and cannot diagnose conditions.

Your role:
1. Listen to patient symptoms described via voice
2. Ask intelligent follow-up questions
3. Extract key medical information
4. Provide triage recommendations (GREEN/AMBER/RED)

CONVERSATION RULES:
- Be empathetic and professional
- Ask ONE question at a time
- Keep responses under 2 sentences for natural conversation
- Always include safety disclaimers when appropriate
- Detect red flags and escalate immediately

RED FLAGS (immediate escalation):
- Chest pain, difficulty breathing
- Severe bleeding, head trauma
- Loss of consciousness
- Signs of stroke (face drooping, arm weakness, speech difficulty)
- Severe allergic reactions
- Suicidal thoughts

TRIAGE LEVELS:
- GREEN: Self-care appropriate, monitor symptoms
- AMBER: Schedule doctor visit within 24-48 hours
- RED: Seek emergency care immediately

Respond in JSON format:
{
  "response": "Your spoken response to the patient",
  "triageLevel": "GREEN" | "AMBER" | "RED" | null,
  "extractedInfo": {
    "symptoms": [],
    "duration": "",
    "severity": "",
    "bodyPart": "",
    "redFlags": []
  },
  "nextQuestion": "Follow-up question if needed",
  "shouldEscalate": boolean,
  "conversationComplete": boolean
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate and sanitize input
    const validation = validateInput(liveTriageInputSchema, rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return validationErrorResponse(validation.error, corsHeaders);
    }
    
    const { transcript, conversationHistory, imageAnalysis, sessionId } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing voice input:', transcript?.substring(0, 50), 'Session:', sessionId);

    const messages = [
      { role: 'system', content: LIVE_TRIAGE_PROMPT },
      ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Include image analysis context if available
    let userContent = `Patient says: "${transcript || ''}"`;
    if (imageAnalysis && typeof imageAnalysis === 'object' && 'detections' in imageAnalysis) {
      const analysis = imageAnalysis as { detections?: unknown[]; overallAssessment?: string; concernLevel?: string };
      if (analysis.detections && Array.isArray(analysis.detections) && analysis.detections.length > 0) {
        userContent += `\n\nVisual analysis detected: ${JSON.stringify(analysis.detections)}`;
        userContent += `\nOverall visual assessment: ${sanitizeText(analysis.overallAssessment, 500)}`;
        userContent += `\nConcern level from vision: ${sanitizeText(analysis.concernLevel, 50)}`;
      }
    }
    messages.push({ role: 'user', content: userContent });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again.',
          response: "I'm processing many requests right now. Please wait a moment and try again."
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted.',
          response: "The AI service is temporarily unavailable. Please try again later."
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      result = {
        response: "I'm having trouble processing that. Could you please repeat?",
        triageLevel: null,
        extractedInfo: {},
        conversationComplete: false,
      };
    }

    console.log('Triage result:', {
      triageLevel: result.triageLevel,
      shouldEscalate: result.shouldEscalate,
      extractedSymptoms: result.extractedInfo?.symptoms?.length || 0
    });

    // Update session in database if we have session ID and triage level
    if (sessionId && result.triageLevel && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from('live_sessions')
          .update({ 
            triage_level: result.triageLevel,
            summary: result.extractedInfo ? JSON.stringify(result.extractedInfo) : null
          })
          .eq('id', sessionId);
        console.log('Updated session triage level:', result.triageLevel);
      } catch (dbError) {
        console.error('Failed to update session:', dbError);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Live triage error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      response: "I apologize, I'm experiencing technical difficulties. Please try again.",
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
