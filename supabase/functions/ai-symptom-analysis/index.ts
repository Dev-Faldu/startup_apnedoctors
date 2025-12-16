import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, painLevel, duration, bodyPart, additionalInfo, patientHistory } = await req.json();
    
    if (!symptoms) {
      return new Response(
        JSON.stringify({ error: "Symptoms are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing symptom analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a medical AI assistant performing symptom analysis and triage assessment.

IMPORTANT: You provide preliminary assessments only. Always recommend consulting a healthcare professional.

Analyze symptoms and return ONLY valid JSON:
{
  "triageLevel": 1-5,
  "triageLevelName": "EMERGENT" | "URGENT" | "LESS_URGENT" | "NON_URGENT" | "ADVICE_ONLY",
  "triageColor": "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE",
  "confidenceScore": 0-100,
  "chiefComplaint": "string",
  "symptomAnalysis": {
    "primarySymptoms": ["string"],
    "secondarySymptoms": ["string"],
    "duration": "string",
    "severity": "mild" | "moderate" | "severe",
    "progression": "improving" | "stable" | "worsening" | "unknown"
  },
  "possibleConditions": [
    {
      "condition": "string",
      "probability": "high" | "medium" | "low",
      "description": "string"
    }
  ],
  "redFlags": ["string"],
  "recommendedActions": ["string"],
  "questionsToAsk": ["string"],
  "urgencyDescription": "string",
  "disclaimer": "string"
}

Triage Levels:
1 - EMERGENT (RED): Life-threatening, immediate care needed
2 - URGENT (ORANGE): Serious, needs prompt attention
3 - LESS_URGENT (YELLOW): Needs attention but stable
4 - NON_URGENT (GREEN): Minor issues, routine care
5 - ADVICE_ONLY (BLUE): Self-care appropriate`
          },
          {
            role: "user",
            content: `Analyze these symptoms:

Symptoms: ${symptoms}
Body Part: ${bodyPart || "Not specified"}
Pain Level: ${painLevel !== undefined ? `${painLevel}/10` : "Not specified"}
Duration: ${duration || "Not specified"}
Additional Info: ${additionalInfo || "None"}
Patient History: ${patientHistory || "Not provided"}

Provide a comprehensive symptom analysis and triage assessment.`
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      result = {
        triageLevel: 4,
        triageLevelName: "NON_URGENT",
        triageColor: "GREEN",
        confidenceScore: 50,
        chiefComplaint: symptoms,
        symptomAnalysis: {
          primarySymptoms: [symptoms],
          secondarySymptoms: [],
          severity: "unknown",
          progression: "unknown"
        },
        possibleConditions: [],
        redFlags: [],
        recommendedActions: ["Consult a healthcare professional for proper evaluation"],
        questionsToAsk: [],
        urgencyDescription: "Unable to complete full analysis",
        disclaimer: "This is not a medical diagnosis. Please consult a healthcare professional."
      };
    }

    // Ensure disclaimer is always present
    if (!result.disclaimer) {
      result.disclaimer = "This AI assessment is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional.";
    }

    console.log("Symptom analysis complete, triage level:", result.triageLevel);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Symptom analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
