import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LIVE_VISION_PROMPT = `You are an AI Medical Vision Analyzer performing real-time injury assessment. You are NOT a doctor and cannot diagnose.

Analyze the image for:
1. Visible signs of injury (redness, swelling, bruising, deformity)
2. Skin condition changes
3. Posture or alignment issues
4. Any concerning visual indicators

Be thorough but concise. Only report what you can actually see in the image.

Respond in JSON:
{
  "detections": [
    {
      "type": "swelling" | "redness" | "bruising" | "deformity" | "wound" | "other",
      "severity": "mild" | "moderate" | "severe",
      "location": "description of location",
      "confidence": 0.0-1.0
    }
  ],
  "overallAssessment": "Brief description of visual findings",
  "concernLevel": "low" | "medium" | "high",
  "recommendations": ["Array of visual-based recommendations"],
  "disclaimer": "This is an AI visual assessment only, not a medical diagnosis."
}

If you cannot see any injury or the image quality is poor, return empty detections with appropriate overallAssessment.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, sessionId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Validate image data - check for empty or invalid data URLs
    const isValidImage = imageBase64 && 
      typeof imageBase64 === 'string' && 
      imageBase64.length > 1000 && 
      !imageBase64.endsWith('data:,') &&
      imageBase64 !== 'data:,' &&
      imageBase64.includes('base64');

    if (!isValidImage) {
      console.log('Invalid or empty image data received, length:', imageBase64?.length || 0);
      return new Response(JSON.stringify({
        detections: [],
        overallAssessment: 'Waiting for valid image capture',
        concernLevel: 'low',
        recommendations: [],
        disclaimer: 'Please ensure camera is active and capturing properly.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing image frame, size:', imageBase64.length);

    const messages: any[] = [
      { role: 'system', content: LIVE_VISION_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image for any visible signs of injury or medical concern. Be specific about what you observe.',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ];

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
        console.error('Vision rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          detections: [],
          overallAssessment: 'Analysis paused due to rate limiting',
          concernLevel: 'low',
          recommendations: [],
          disclaimer: 'Please wait a moment before the next analysis.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Vision payment required');
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted',
          detections: [],
          overallAssessment: 'Vision analysis temporarily unavailable',
          concernLevel: 'low',
          recommendations: [],
          disclaimer: 'The AI service is temporarily unavailable.'
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
      console.error('Failed to parse vision response:', content);
      result = {
        detections: [],
        overallAssessment: 'Unable to analyze image',
        concernLevel: 'low',
        recommendations: [],
        disclaimer: 'AI analysis encountered an error.',
      };
    }

    console.log('Vision result:', {
      detectionCount: result.detections?.length || 0,
      concernLevel: result.concernLevel
    });

    // Save detections to database if we have session ID
    if (sessionId && result.detections?.length > 0 && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const detectionsToInsert = result.detections.map((d: any) => ({
          session_id: sessionId,
          detection_type: d.type,
          severity: d.severity,
          location: d.location,
          confidence: d.confidence,
        }));

        await supabase
          .from('live_vision_detections')
          .insert(detectionsToInsert);
        console.log('Saved', detectionsToInsert.length, 'vision detections');
      } catch (dbError) {
        console.error('Failed to save vision detections:', dbError);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Live vision error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      detections: [],
      overallAssessment: 'Vision analysis error',
      concernLevel: 'low',
      recommendations: [],
      disclaimer: 'Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
