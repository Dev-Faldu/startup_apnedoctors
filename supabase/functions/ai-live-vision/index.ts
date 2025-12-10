import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const messages: any[] = [
      { role: 'system', content: LIVE_VISION_PROMPT },
    ];

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image for any visible signs of injury or medical concern.',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      });
    } else {
      return new Response(JSON.stringify({
        detections: [],
        overallAssessment: 'No image provided for analysis',
        concernLevel: 'low',
        recommendations: [],
        disclaimer: 'Please capture an image for visual assessment.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
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
        detections: [],
        overallAssessment: 'Unable to analyze image',
        concernLevel: 'low',
        recommendations: [],
        disclaimer: 'AI analysis encountered an error.',
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Live vision error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
