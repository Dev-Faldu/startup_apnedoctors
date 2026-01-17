import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REPORT_SYSTEM_PROMPT = `You are an expert medical report generator for an AI-powered telemedicine consultation system. Generate comprehensive, professional medical consultation reports.

You will receive data from a live voice + video consultation including:
- Voice conversation transcript between patient and AI
- Visual analysis results from camera captures
- Real-time triage assessments

Generate a detailed, clinically-formatted report. Return ONLY valid JSON matching this exact structure:

{
  "reportId": "UUID format string",
  "generatedAt": "ISO timestamp",
  "sessionDuration": "string (e.g., '15 minutes')",
  "patientSummary": {
    "chiefComplaint": "Main reason for consultation",
    "presentingSymptoms": ["symptom1", "symptom2"],
    "affectedArea": "Body location",
    "duration": "How long symptoms present",
    "painLevel": 0-10,
    "conversationSummary": "Brief summary of the consultation dialogue"
  },
  "clinicalFindings": {
    "visualAssessment": {
      "findings": ["finding1", "finding2"],
      "abnormalities": ["if any"],
      "severity": "mild" | "moderate" | "severe",
      "inflammationScore": 0-10,
      "redness": "none" | "mild" | "moderate" | "severe",
      "swelling": "none" | "mild" | "moderate" | "severe"
    },
    "symptomAnalysis": ["analysis point 1", "analysis point 2"],
    "vitalSignsEstimate": {
      "concernLevel": "low" | "moderate" | "high",
      "recommendation": "string"
    }
  },
  "triageAssessment": {
    "level": 1-5,
    "category": "EMERGENT" | "URGENT" | "LESS_URGENT" | "NON_URGENT" | "ADVICE_ONLY",
    "color": "RED" | "AMBER" | "GREEN",
    "urgency": "Description of urgency",
    "rationale": "Why this triage level",
    "possibleConditions": ["condition1", "condition2"],
    "differentialDiagnosis": ["diagnosis1", "diagnosis2"]
  },
  "redFlags": [
    {
      "flag": "Warning sign",
      "significance": "Why it matters",
      "action": "What to do"
    }
  ],
  "recommendations": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"],
    "selfCare": ["instruction1", "instruction2"],
    "whenToSeekCare": ["emergency sign 1", "emergency sign 2"],
    "followUp": "Follow-up recommendation",
    "specialistReferral": true/false,
    "specialistType": "Type of specialist if needed"
  },
  "aiAnalysis": {
    "voiceAnalysisInsights": ["insight1", "insight2"],
    "visualAnalysisInsights": ["insight1", "insight2"],
    "multimodalCorrelation": "How voice and visual findings correlate"
  },
  "confidenceMetrics": {
    "overall": 0-100,
    "voiceAnalysis": 0-100,
    "visualAnalysis": 0-100,
    "triageAccuracy": 0-100
  },
  "disclaimer": "This AI-generated report is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for proper diagnosis and treatment. If you experience severe symptoms or a medical emergency, call emergency services immediately."
}

IMPORTANT GUIDELINES:
1. Be thorough but concise in your analysis
2. Prioritize patient safety - when in doubt, recommend professional consultation
3. Highlight any red flags prominently
4. Provide actionable, practical recommendations
5. Base triage on established clinical guidelines
6. If data is insufficient, note limitations and provide conservative recommendations
7. Always include the full disclaimer
8. Use professional medical terminology with layman explanations`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, sessionDuration, conversation, triageData, visionData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating live session report for session:", sessionId);

    // Build conversation context
    const conversationText = conversation?.map((msg: any) => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n') || 'No conversation recorded';

    // Build vision context
    const visionText = visionData ? `
Total Visual Analyses: ${visionData.totalAnalyses}
Detections: ${JSON.stringify(visionData.detections)}
Concern Levels Observed: ${visionData.concernLevels.join(', ')}
Overall Assessments: ${visionData.overallAssessments.join(' | ')}
Visual Recommendations: ${visionData.recommendations.join('; ')}
    ` : 'No visual analysis performed';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: REPORT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a comprehensive medical consultation report from this live session data:

SESSION INFORMATION:
- Session ID: ${sessionId}
- Duration: ${sessionDuration}

CONVERSATION TRANSCRIPT:
${conversationText}

TRIAGE DATA:
${triageData ? JSON.stringify(triageData, null, 2) : 'No triage data available'}

VISUAL ANALYSIS DATA:
${visionText}

Generate a complete, professional medical report based on all available data. Be thorough in your analysis and recommendations.`
          }
        ],
        max_tokens: 5000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error("AI Gateway error:", status);
      
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let report;
    try {
      report = JSON.parse(content);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      // Create fallback report
      report = {
        reportId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        sessionDuration: sessionDuration || "Unknown",
        patientSummary: {
          chiefComplaint: triageData?.extractedInfo?.symptoms?.[0] || "Unable to determine",
          presentingSymptoms: triageData?.extractedInfo?.symptoms || [],
          affectedArea: triageData?.extractedInfo?.bodyPart || "Not specified",
          duration: triageData?.extractedInfo?.duration || "Not specified",
          painLevel: 0,
          conversationSummary: "Report generation encountered an issue. Please review conversation manually."
        },
        clinicalFindings: {
          visualAssessment: {
            findings: [],
            abnormalities: [],
            severity: "mild",
            inflammationScore: 0,
            redness: "none",
            swelling: "none"
          },
          symptomAnalysis: [],
          vitalSignsEstimate: {
            concernLevel: "low",
            recommendation: "Please consult a healthcare professional for proper evaluation."
          }
        },
        triageAssessment: {
          level: triageData?.triageLevel === "RED" ? 2 : triageData?.triageLevel === "AMBER" ? 3 : 4,
          category: triageData?.triageLevel === "RED" ? "URGENT" : "NON_URGENT",
          color: triageData?.triageLevel || "GREEN",
          urgency: "Please consult a healthcare professional",
          rationale: "Unable to generate detailed analysis",
          possibleConditions: [],
          differentialDiagnosis: []
        },
        redFlags: triageData?.extractedInfo?.redFlags?.map((f: string) => ({
          flag: f,
          significance: "Requires attention",
          action: "Consult healthcare provider"
        })) || [],
        recommendations: {
          immediate: ["Consult a healthcare professional for proper evaluation"],
          shortTerm: [],
          selfCare: [],
          whenToSeekCare: ["If symptoms worsen", "If new symptoms develop"],
          followUp: "Schedule an appointment with your doctor",
          specialistReferral: false
        },
        aiAnalysis: {
          voiceAnalysisInsights: [],
          visualAnalysisInsights: [],
          multimodalCorrelation: "Unable to correlate data at this time."
        },
        confidenceMetrics: {
          overall: 50,
          voiceAnalysis: 50,
          visualAnalysis: 50,
          triageAccuracy: 50
        },
        disclaimer: "This AI-generated report is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for proper diagnosis and treatment."
      };
    }

    // Ensure required fields
    report.reportId = report.reportId || crypto.randomUUID();
    report.generatedAt = report.generatedAt || new Date().toISOString();
    report.sessionDuration = report.sessionDuration || sessionDuration;

    console.log("Report generated successfully:", report.reportId);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Report generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Report generation failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
