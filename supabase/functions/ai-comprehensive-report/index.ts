import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { comprehensiveReportInputSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

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
    const validation = validateInput(comprehensiveReportInputSchema, rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return validationErrorResponse(validation.error, corsHeaders);
    }
    
    const { patientInfo, symptomAnalysis, visionAnalysis, poseAnalysis, sessionId, assessmentId } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating comprehensive medical report...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are a medical report generation AI. Generate comprehensive, professional medical assessment reports.

Create a detailed report combining all available data. Return ONLY valid JSON:
{
  "reportId": "string (UUID format)",
  "generatedAt": "ISO timestamp",
  "patientSummary": {
    "chiefComplaint": "string",
    "presentingSymptoms": ["string"],
    "affectedArea": "string",
    "duration": "string",
    "painLevel": number
  },
  "clinicalFindings": {
    "visualAssessment": {
      "findings": ["string"],
      "abnormalities": ["string"],
      "severity": "mild" | "moderate" | "severe"
    },
    "postureAssessment": {
      "findings": ["string"],
      "limitations": ["string"]
    },
    "symptomCorrelation": "string"
  },
  "triageAssessment": {
    "level": 1-5,
    "category": "EMERGENT" | "URGENT" | "LESS_URGENT" | "NON_URGENT" | "ADVICE_ONLY",
    "color": "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE",
    "rationale": "string"
  },
  "differentialDiagnosis": [
    {
      "condition": "string",
      "likelihood": "high" | "medium" | "low",
      "supportingEvidence": ["string"],
      "additionalTestsNeeded": ["string"]
    }
  ],
  "redFlags": [
    {
      "flag": "string",
      "significance": "string",
      "action": "string"
    }
  ],
  "recommendations": {
    "immediate": ["string"],
    "shortTerm": ["string"],
    "followUp": ["string"],
    "selfCare": ["string"]
  },
  "medicationConsiderations": ["string"],
  "whenToSeekEmergencyCare": ["string"],
  "prognosis": "string",
  "disclaimer": "string",
  "reviewedBy": "AI Medical Assessment System"
}`
          },
          {
            role: "user",
            content: `Generate a comprehensive medical report from the following data:

PATIENT INFORMATION:
${JSON.stringify(patientInfo || {}, null, 2)}

SYMPTOM ANALYSIS:
${JSON.stringify(symptomAnalysis || {}, null, 2)}

VISION/IMAGE ANALYSIS:
${JSON.stringify(visionAnalysis || {}, null, 2)}

POSE/MOVEMENT ANALYSIS:
${JSON.stringify(poseAnalysis || {}, null, 2)}

Create a thorough, professional medical assessment report combining all available information.`
          }
        ],
        max_tokens: 4000,
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

    let report;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      report = {
        reportId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        error: "Unable to generate structured report",
        rawContent: content,
        disclaimer: "This AI assessment could not be fully processed. Please consult a healthcare professional."
      };
    }

    // Ensure required fields
    report.reportId = report.reportId || crypto.randomUUID();
    report.generatedAt = report.generatedAt || new Date().toISOString();
    report.disclaimer = report.disclaimer || "This AI-generated report is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.";

    // Save to database if assessmentId provided
    if (assessmentId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("triage_reports").insert({
        assessment_id: assessmentId,
        triage_level: report.triageAssessment?.level || 4,
        risk_level: report.triageAssessment?.category || "NON_URGENT",
        medical_summary: report.prognosis || JSON.stringify(report.clinicalFindings),
        chief_complaint: report.patientSummary?.chiefComplaint,
        possible_conditions: report.differentialDiagnosis,
        recommendations: report.recommendations,
        red_flags: report.redFlags,
        confidence_score: 85,
      });
    }

    console.log("Report generated successfully");

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
