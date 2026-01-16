import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { emergencyCheckInputSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Quick emergency screening without full AI call
const EMERGENCY_KEYWORDS = [
  "chest pain", "heart attack", "can't breathe", "difficulty breathing",
  "severe bleeding", "unconscious", "seizure", "stroke", "paralysis",
  "severe head injury", "severe burn", "choking", "anaphylaxis",
  "suicidal", "overdose", "poison", "can't move", "numbness face",
  "slurred speech", "severe allergic", "swelling throat"
];

const RED_FLAG_PATTERNS = [
  /chest\s*(pain|tightness|pressure)/i,
  /can('t|not)\s*breathe/i,
  /severe\s*(pain|bleeding|burn)/i,
  /loss\s*of\s*consciousness/i,
  /paralysis|paralyzed/i,
  /stroke|heart\s*attack/i,
  /suicid|kill\s*myself/i,
  /overdose|poisoning/i,
  /seizure|convulsion/i,
  /anaphyla|throat\s*closing/i,
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate and sanitize input
    const validation = validateInput(emergencyCheckInputSchema, rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return validationErrorResponse(validation.error, corsHeaders);
    }
    
    const { text, symptoms } = validation.data;
    
    // Build input text for analysis
    let inputText = '';
    if (text) inputText += text + ' ';
    if (symptoms) {
      if (Array.isArray(symptoms)) {
        inputText += symptoms.join(' ');
      } else {
        inputText += symptoms;
      }
    }
    inputText = inputText.toLowerCase();

    console.log("Emergency check for:", inputText.substring(0, 100));

    // Quick keyword scan
    const foundKeywords = EMERGENCY_KEYWORDS.filter(kw => inputText.includes(kw));
    const matchedPatterns = RED_FLAG_PATTERNS.filter(pattern => pattern.test(inputText));

    const isEmergency = foundKeywords.length > 0 || matchedPatterns.length > 0;
    const severity = matchedPatterns.length >= 2 ? "critical" : 
                     matchedPatterns.length === 1 ? "high" :
                     foundKeywords.length >= 2 ? "high" :
                     foundKeywords.length === 1 ? "medium" : "low";

    let recommendation = "";
    let triageLevel = "GREEN";

    if (severity === "critical") {
      triageLevel = "RED";
      recommendation = "CALL 911 IMMEDIATELY. These symptoms may indicate a life-threatening emergency.";
    } else if (severity === "high") {
      triageLevel = "RED";
      recommendation = "Seek emergency medical care immediately. Go to the nearest emergency room or call emergency services.";
    } else if (severity === "medium") {
      triageLevel = "ORANGE";
      recommendation = "These symptoms require prompt medical attention. Consider visiting urgent care or emergency room.";
    }

    const result = {
      isEmergency,
      severity,
      triageLevel,
      foundKeywords,
      matchedPatternCount: matchedPatterns.length,
      recommendation,
      callEmergencyServices: severity === "critical",
      timestamp: new Date().toISOString()
    };

    console.log("Emergency check result:", severity, "isEmergency:", isEmergency);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Emergency check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        isEmergency: false,
        severity: "unknown",
        recommendation: "Unable to assess. If you're experiencing a medical emergency, please call emergency services immediately."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
