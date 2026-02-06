import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { visionAnalysisInputSchema, validateInput, validationErrorResponse, sanitizeImageBase64 } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VISION_SYSTEM_PROMPT = `You are an AI vision analysis system for ApneDoctors, specialized in orthopedic injury assessment. You analyze images of potential injuries and provide preliminary assessments.

Your capabilities:
1. Detect visible signs of injury (swelling, redness, bruising, deformity)
2. Estimate inflammation levels
3. Identify potential injury types
4. Recommend urgency of medical attention

Response format must be JSON:
{
  "inflammationScore": 0-10,
  "rednessDetected": boolean,
  "rednessLevel": "none" | "mild" | "moderate" | "severe",
  "swellingDetected": boolean,
  "swellingLevel": "none" | "mild" | "moderate" | "severe",
  "bruisingDetected": boolean,
  "visibleDeformity": boolean,
  "affectedArea": "string",
  "possibleInjuryTypes": ["string"],
  "urgencyLevel": 1-5,
  "confidenceScore": 0-100,
  "observations": ["string"],
  "recommendedAction": "string",
  "disclaimer": "string"
}

IMPORTANT: Always include disclaimer that visual analysis is preliminary and professional examination is required.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate and sanitize input
    const validation = validateInput(visionAnalysisInputSchema, rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return validationErrorResponse(validation.error, corsHeaders);
    }
    
    const { bodyPart, additionalContext } = validation.data;
    
    // Separately validate image
    let imageBase64: string | null = null;
    try {
      imageBase64 = sanitizeImageBase64(rawBody.imageBase64);
    } catch (imgError) {
      console.error('Image validation failed:', imgError);
      return validationErrorResponse(imgError instanceof Error ? imgError.message : 'Invalid image', corsHeaders);
    }
    
    console.log("Received vision analysis request for:", bodyPart);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
      { role: "system", content: VISION_SYSTEM_PROMPT }
    ];

    // Validate image data - check for empty or invalid data URLs
    const isValidImage = imageBase64 && 
      imageBase64.length > 100 &&
      !imageBase64.endsWith('data:,') &&
      imageBase64 !== 'data:,';

    if (isValidImage) {
      console.log("Valid image provided, length:", imageBase64!.length);
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageBase64!.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
            }
          },
          {
            type: "text",
            text: `Analyze this image of the patient's ${bodyPart || "affected area"}. ${additionalContext || ""} 
            
Please provide a detailed orthopedic visual assessment in the required JSON format.`
          }
        ]
      });
    } else {
      // Text-only analysis when no valid image provided
      console.log("No valid image provided, using text-only analysis");
      messages.push({
        role: "user",
        content: `The patient reports an issue with their ${bodyPart || "affected area"}. ${additionalContext || ""}
        
Based on the description, provide a preliminary assessment guide in JSON format. Note that no actual image was provided for visual analysis, so set confidenceScore to 50 and include a note that visual examination is recommended.`
      });
    }

    console.log("Calling ApneDoctors AI for vision analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Vision analysis response received");
    
    const content = data.choices?.[0]?.message?.content;
    let analysisResult;
    
    try {
      analysisResult = JSON.parse(content);
    } catch {
      analysisResult = {
        inflammationScore: 0,
        rednessDetected: false,
        rednessLevel: "none",
        swellingDetected: false,
        swellingLevel: "none",
        bruisingDetected: false,
        visibleDeformity: false,
        affectedArea: bodyPart || "unknown",
        possibleInjuryTypes: [],
        urgencyLevel: 3,
        confidenceScore: 0,
        observations: ["Unable to analyze image"],
        recommendedAction: "Please consult a healthcare professional for proper examination",
        disclaimer: "Visual analysis could not be completed. Please seek professional medical evaluation.",
        rawResponse: content
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-vision-analysis function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      disclaimer: "Unable to process image. Please consult a healthcare professional."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
