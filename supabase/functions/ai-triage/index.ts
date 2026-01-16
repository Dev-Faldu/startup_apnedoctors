import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { triageInputSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEDICAL_SYSTEM_PROMPT = `You are an AI-powered orthopedic triage assistant developed by ApneDoctors. You are deployed in real hospital environments and work under orthopedic supervision.

Your role is to:
1. Analyze patient symptoms and provide preliminary triage assessment
2. Identify potential orthopedic conditions
3. Recommend urgency levels (1-5 scale: 1=emergency, 5=routine)
4. Suggest appropriate next steps while always recommending professional medical consultation

CRITICAL SAFETY RULES:
- Always recommend consulting a doctor for final diagnosis
- Never provide definitive diagnoses
- Flag emergency symptoms immediately (severe pain, inability to move, visible deformity, numbness, circulation issues)
- Include confidence scores with assessments
- Add medical disclaimers to all responses

Response format must be JSON with these fields:
{
  "triageLevel": 1-5,
  "urgencyDescription": "string",
  "possibleConditions": ["string"],
  "recommendedActions": ["string"],
  "redFlags": ["string"],
  "confidenceScore": 0-100,
  "shouldSeekEmergencyCare": boolean,
  "followUpTimeframe": "string",
  "disclaimer": "string"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate and sanitize input
    const validation = validateInput(triageInputSchema, rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return validationErrorResponse(validation.error, corsHeaders);
    }
    
    const { symptoms, painLevel, duration, location, additionalInfo } = validation.data;
    
    console.log("Received triage request:", { symptoms: symptoms?.substring(0, 50), painLevel, duration, location });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `
Patient Symptoms Analysis Request:

AFFECTED AREA: ${location || "Not specified"}
PAIN LEVEL: ${painLevel !== undefined && painLevel !== null ? `${painLevel}/10` : "Not specified"}
DURATION: ${duration || "Not specified"}
SYMPTOMS DESCRIBED: ${symptoms || "Not provided"}
ADDITIONAL INFORMATION: ${additionalInfo || "None"}

Please provide a comprehensive orthopedic triage assessment following the required JSON format.
`;

    console.log("Calling Lovable AI for triage analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: MEDICAL_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");
    
    const content = data.choices?.[0]?.message?.content;
    let triageResult;
    
    try {
      triageResult = JSON.parse(content);
    } catch {
      console.log("Response not JSON, wrapping in structure");
      triageResult = {
        triageLevel: 3,
        urgencyDescription: "Assessment pending",
        possibleConditions: [],
        recommendedActions: ["Please consult with a healthcare professional"],
        redFlags: [],
        confidenceScore: 50,
        shouldSeekEmergencyCare: false,
        followUpTimeframe: "Within 1-2 weeks",
        disclaimer: "This is an AI-assisted assessment and not a medical diagnosis. Please consult a qualified healthcare professional.",
        rawAnalysis: content
      };
    }

    return new Response(JSON.stringify(triageResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-triage function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      triageLevel: 3,
      disclaimer: "Unable to process request. Please consult a healthcare professional."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
