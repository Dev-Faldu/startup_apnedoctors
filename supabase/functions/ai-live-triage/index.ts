import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { transcript, conversationHistory, imageAnalysis } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const messages = [
      { role: 'system', content: LIVE_TRIAGE_PROMPT },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Include image analysis context if available
    let userContent = `Patient says: "${transcript}"`;
    if (imageAnalysis) {
      userContent += `\n\nVisual analysis: ${JSON.stringify(imageAnalysis)}`;
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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = {
        response: "I'm having trouble processing that. Could you please repeat?",
        triageLevel: null,
        extractedInfo: {},
        conversationComplete: false,
      };
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
