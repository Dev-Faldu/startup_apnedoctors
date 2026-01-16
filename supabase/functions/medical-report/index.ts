import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { medicalReportInputSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPORT_SYSTEM_PROMPT = `You are an AI medical report generator for ApneDoctors. Generate comprehensive, professional medical assessment reports based on triage and vision analysis data.

Create a structured medical report in JSON format:
{
  "reportId": "string (UUID format)",
  "generatedAt": "ISO timestamp",
  "patientSummary": {
    "chiefComplaint": "string",
    "affectedArea": "string",
    "duration": "string",
    "painLevel": number
  },
  "clinicalFindings": {
    "visualAssessment": {
      "inflammationScore": number,
      "redness": "string",
      "swelling": "string",
      "otherFindings": ["string"]
    },
    "symptomAnalysis": ["string"]
  },
  "triageAssessment": {
    "level": 1-5,
    "urgency": "string",
    "possibleConditions": ["string"],
    "differentialDiagnosis": ["string"]
  },
  "recommendations": {
    "immediateActions": ["string"],
    "treatmentSuggestions": ["string"],
    "followUpPlan": "string",
    "specialistReferral": boolean,
    "specialistType": "string or null"
  },
  "redFlags": ["string"],
  "confidenceMetrics": {
    "overallConfidence": number,
    "visualAnalysisConfidence": number,
    "symptomAnalysisConfidence": number
  },
  "disclaimer": "string",
  "nextSteps": ["string"]
}

ALWAYS include:
- Professional medical terminology
- Clear action items
- Appropriate disclaimers
- Emergency indicators if applicable`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate and sanitize input
    const validation = validateInput(medicalReportInputSchema, rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return validationErrorResponse(validation.error, corsHeaders);
    }
    
    const { triageData, visionData, patientInfo } = validation.data;
    
    console.log("Generating medical report...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `
Generate a comprehensive medical assessment report based on the following data:

PATIENT INFORMATION:
${JSON.stringify(patientInfo, null, 2)}

TRIAGE ANALYSIS RESULTS:
${JSON.stringify(triageData, null, 2)}

VISION ANALYSIS RESULTS:
${JSON.stringify(visionData, null, 2)}

Please generate a professional medical report in the required JSON format.
`;

    console.log("Calling Lovable AI for report generation...");

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
          { role: "user", content: userMessage },
        ],
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
    console.log("Report generated successfully");
    
    const content = data.choices?.[0]?.message?.content;
    let report;
    
    try {
      report = JSON.parse(content);
      // Ensure reportId is set
      if (!report.reportId) {
        report.reportId = crypto.randomUUID();
      }
      if (!report.generatedAt) {
        report.generatedAt = new Date().toISOString();
      }
    } catch {
      report = {
        reportId: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        error: "Unable to generate structured report",
        rawContent: content,
        disclaimer: "Report generation encountered an issue. Please consult a healthcare professional."
      };
    }

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in medical-report function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      reportId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      disclaimer: "Unable to generate report. Please consult a healthcare professional."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
