import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { objectDetectionInputSchema, validateInput, validationErrorResponse, sanitizeImageBase64 } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate and sanitize input
    const validation = validateInput(objectDetectionInputSchema, rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return validationErrorResponse(validation.error, corsHeaders);
    }
    
    const { sessionId, analysisType } = validation.data;
    
    // Separately validate image
    let image: string | null = null;
    try {
      image = sanitizeImageBase64(rawBody.image);
    } catch (imgError) {
      console.error('Image validation failed:', imgError);
      return validationErrorResponse(imgError instanceof Error ? imgError.message : 'Invalid image', corsHeaders);
    }
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing pose analysis request, type:", analysisType || "general");

    const systemPrompt = `You are a medical pose and movement analysis AI, similar to MediaPipe but specialized for medical assessment.

Analyze the image for:
1. Body posture and alignment
2. Joint positions and angles
3. Signs of injury-related movement compensation
4. Range of motion indicators
5. Asymmetry between body sides

Return ONLY valid JSON in this exact format:
{
  "poseAnalysis": {
    "overallPosture": "good" | "fair" | "poor",
    "postureScore": 0-100,
    "alignment": "normal" | "slight_deviation" | "significant_deviation"
  },
  "keypoints": [
    {
      "name": "string (e.g., left_shoulder, right_knee)",
      "position": [x, y],
      "confidence": 0-1,
      "angle": null | number,
      "status": "normal" | "concern" | "critical"
    }
  ],
  "jointAnalysis": [
    {
      "joint": "string",
      "angle": number,
      "normalRange": [min, max],
      "status": "within_range" | "limited" | "excessive",
      "concern": "string or null"
    }
  ],
  "asymmetryFindings": [
    {
      "area": "string",
      "description": "string",
      "severity": "mild" | "moderate" | "severe"
    }
  ],
  "movementRecommendations": ["string"],
  "medicalFlags": ["string"],
  "overallAssessment": "string"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Perform a detailed pose and movement analysis on this image. Focus on: ${analysisType || "overall body posture, joint positions, and any signs of injury or compensation patterns"}.`
              },
              {
                type: "image_url",
                image_url: { url: image }
              }
            ]
          }
        ],
        max_tokens: 2500,
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
        poseAnalysis: { overallPosture: "unknown", postureScore: 0, alignment: "unknown" },
        keypoints: [],
        jointAnalysis: [],
        asymmetryFindings: [],
        movementRecommendations: [],
        medicalFlags: [],
        overallAssessment: content
      };
    }

    // Save to database if sessionId provided
    if (sessionId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("live_vision_detections").insert({
        session_id: sessionId,
        detection_type: "pose_analysis",
        confidence: (result.poseAnalysis?.postureScore || 0) / 100,
        severity: result.poseAnalysis?.overallPosture === "poor" ? "high" : 
                  result.poseAnalysis?.overallPosture === "fair" ? "medium" : "low",
        location: JSON.stringify(result.keypoints || []),
      });
    }

    console.log("Pose analysis complete");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Pose analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
