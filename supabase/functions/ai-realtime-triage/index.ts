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
    const { 
      conversationHistory, 
      currentMessage, 
      visionContext,
      sessionId 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing real-time triage...");

    // Build conversation context
    const messages = [
      {
        role: "system",
        content: `You are an AI medical triage assistant conducting a real-time patient interview.

Your goals:
1. Gather relevant medical information through natural conversation
2. Assess urgency and triage level continuously
3. Identify red flags that need immediate attention
4. Provide empathetic, clear responses
5. Guide the patient through describing their condition

IMPORTANT RULES:
- Never diagnose - only assess and recommend
- If red flags detected, urgently recommend seeking care
- Ask clarifying questions to gather complete information
- Be empathetic and professional

Return ONLY valid JSON:
{
  "response": "Your conversational response to the patient",
  "triageLevel": "GREEN" | "YELLOW" | "ORANGE" | "RED",
  "triageScore": 1-5,
  "confidence": 0-100,
  "extractedInfo": {
    "symptoms": ["string"],
    "bodyPart": "string or null",
    "duration": "string or null",
    "severity": "mild" | "moderate" | "severe" | null,
    "redFlags": ["string"]
  },
  "suggestedQuestions": ["string"],
  "actionNeeded": "continue_conversation" | "recommend_urgent_care" | "recommend_emergency" | "assessment_complete",
  "visionInsights": "string or null"
}`
      }
    ];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        });
      }
    }

    // Add current message with optional vision context
    let userContent = currentMessage;
    if (visionContext) {
      userContent = `[Vision Analysis Context: ${JSON.stringify(visionContext)}]\n\nPatient says: ${currentMessage}`;
    }
    messages.push({ role: "user", content: userContent });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded",
            response: "I'm experiencing high demand. Please wait a moment and try again.",
            triageLevel: "YELLOW",
            actionNeeded: "continue_conversation"
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Usage limit reached",
            response: "The service is temporarily unavailable. Please try again later.",
            triageLevel: "YELLOW",
            actionNeeded: "continue_conversation"
          }),
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
        // If no JSON, treat content as response
        result = {
          response: content,
          triageLevel: "GREEN",
          triageScore: 4,
          confidence: 60,
          extractedInfo: { symptoms: [], redFlags: [] },
          actionNeeded: "continue_conversation"
        };
      }
    } catch (parseError) {
      result = {
        response: content,
        triageLevel: "GREEN",
        triageScore: 4,
        confidence: 50,
        extractedInfo: { symptoms: [], redFlags: [] },
        actionNeeded: "continue_conversation"
      };
    }

    // Save transcript and update session if sessionId provided
    if (sessionId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Save user message
      await supabase.from("live_transcripts").insert({
        session_id: sessionId,
        role: "user",
        content: currentMessage
      });

      // Save AI response
      await supabase.from("live_transcripts").insert({
        session_id: sessionId,
        role: "assistant",
        content: result.response
      });

      // Update session triage level
      await supabase.from("live_sessions")
        .update({ 
          triage_level: result.triageLevel,
          updated_at: new Date().toISOString()
        })
        .eq("id", sessionId);
    }

    console.log("Real-time triage complete, level:", result.triageLevel);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Real-time triage error:", error);
    const errorMessage = error instanceof Error ? error.message : "Triage failed";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: "I apologize, but I'm having trouble processing your message. Please try again.",
        triageLevel: "GREEN",
        actionNeeded: "continue_conversation"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
