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
    
    const { sessionId } = validation.data;
    
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

    console.log("Processing object detection request...");

    // Use Lovable AI (Gemini) for vision-based object detection
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
            content: `You are a medical image analysis AI specialized in detecting injuries, abnormalities, and anatomical features.
            
Analyze the image and return a JSON response with detected objects in YOLO-style format.

For each detection, provide:
- label: what was detected (e.g., "swelling", "bruise", "redness", "wound", "hand", "knee", etc.)
- confidence: 0-1 score
- bbox: [x, y, width, height] normalized 0-1 coordinates
- severity: "low", "medium", "high" for medical findings
- description: brief description

Return ONLY valid JSON in this exact format:
{
  "detections": [
    {
      "label": "string",
      "confidence": 0.95,
      "bbox": [0.1, 0.2, 0.3, 0.4],
      "severity": "medium",
      "description": "string"
    }
  ],
  "bodyPartDetected": "string or null",
  "overallAssessment": "string",
  "medicalConcerns": ["string"],
  "recommendations": ["string"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this medical image. Detect all visible injuries, abnormalities, body parts, and areas of concern. Provide bounding box coordinates for each detection."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
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
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      result = {
        detections: [],
        bodyPartDetected: null,
        overallAssessment: content,
        medicalConcerns: [],
        recommendations: ["Unable to parse detailed analysis"]
      };
    }

    // Save to database if sessionId provided
    if (sessionId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      for (const detection of result.detections || []) {
        await supabase.from("live_vision_detections").insert({
          session_id: sessionId,
          detection_type: detection.label,
          confidence: detection.confidence,
          severity: detection.severity,
          location: detection.bbox ? JSON.stringify(detection.bbox) : null,
        });
      }
    }

    console.log("Object detection complete:", result.detections?.length || 0, "objects detected");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Object detection error:", error);
    const errorMessage = error instanceof Error ? error.message : "Detection failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
