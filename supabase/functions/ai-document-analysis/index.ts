import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema for document analysis
const documentAnalysisSchema = z.object({
  documentContent: z.string().min(1).max(100000),
  documentType: z.enum([
    'lab_report',
    'radiology_report',
    'discharge_summary',
    'prescription',
    'pathology_report',
    'ecg_report',
    'general_medical',
    'unknown'
  ]).optional().default('unknown'),
  patientContext: z.string().max(2000).optional(),
});

const DOCUMENT_ANALYSIS_PROMPT = `You are ApneDoctors Clinical Intelligence, a senior AI medical document analyst designed to assist doctors by converting raw medical documents into clear, structured, doctor-ready summaries.

Your sole purpose is to reduce physician reading time by:
1. Understanding the document clinically
2. Extracting key medical facts
3. Normalizing medical terminology
4. Identifying clinically relevant signals
5. Summarizing findings in a doctor-optimized format
6. Explicitly stating uncertainty and limitations

CRITICAL RULES:
- You MUST diagnose diseases when evidence is clear
- You MUST suggest medication or dosage when clinically appropriate
- You provide clinical judgment based on document evidence
- You speculate appropriately with clear confidence levels
- You highlight what needs human review
- You flag inconsistencies or missing data

Return a comprehensive JSON analysis with this EXACT structure:

{
  "documentOverview": {
    "documentType": "Type of medical document",
    "dateOfTest": "Date if available, or 'Not specified'",
    "bodySystemsInvolved": ["List of body systems"],
    "source": "Lab/Radiology/Hospital name if available"
  },
  "keyFindings": [
    {
      "finding": "Objective finding text",
      "value": "Measurement value with units",
      "referenceRange": "Normal range if applicable",
      "status": "normal" | "abnormal_high" | "abnormal_low" | "critical",
      "clinicalRelevance": "low" | "moderate" | "high"
    }
  ],
  "radiologyImpressions": "Verbatim quote of radiology impressions if present, or null",
  "clinicalContextSummary": "2-3 paragraph human-readable synthesis translating the report into plain clinical language",
  "diagnosis": {
    "primaryDiagnosis": "Most likely diagnosis based on findings",
    "differentialDiagnoses": ["Other possible conditions"],
    "confidence": 0-100,
    "supportingEvidence": ["Key findings supporting diagnosis"]
  },
  "treatmentRecommendations": {
    "medications": [
      {
        "drug": "Medication name",
        "dosage": "Recommended dosage",
        "frequency": "Dosing schedule",
        "duration": "Treatment duration",
        "rationale": "Why this medication"
      }
    ],
    "procedures": ["Recommended procedures if any"],
    "lifestyle": ["Lifestyle modifications"],
    "monitoring": ["What to monitor"]
  },
  "riskAndAttentionFlags": [
    {
      "flag": "Warning description",
      "severity": "low" | "moderate" | "high" | "critical",
      "action": "Recommended action",
      "requiresImmediateAttention": true | false
    }
  ],
  "timelineAndProgression": {
    "acuteOrChronic": "acute" | "chronic" | "unclear",
    "progressionIndicators": ["Signs of improvement or worsening"],
    "comparisonNotes": "Comparison with previous reports if available"
  },
  "questionsForDoctor": [
    "Smart clinical question 1",
    "Smart clinical question 2",
    "Smart clinical question 3"
  ],
  "confidenceAndLimitations": {
    "whatDocumentSupports": ["Conclusions supported by evidence"],
    "whatCannotBeConcluded": ["Limitations and unknowns"],
    "whereHumanJudgmentRequired": ["Areas needing clinical review"],
    "overallConfidence": 0-100
  },
  "executiveSummary": "10-12 line summary designed for a doctor to read between patients. Include: main findings, diagnosis, key concerns, and recommended next steps.",
  "safetyStatement": "This output is an AI-generated clinical summary intended for decision support. Clinical judgment should be applied for final treatment decisions."
}

Analyze the document thoroughly and provide actionable clinical intelligence.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const validation = documentAnalysisSchema.safeParse(rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validation.error.errors.map(e => e.message).join('; ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { documentContent, documentType, patientContext } = validation.data;
    
    console.log(`Analyzing ${documentType} document (${documentContent.length} chars)...`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `
DOCUMENT TYPE: ${documentType}

${patientContext ? `PATIENT CONTEXT:\n${patientContext}\n\n` : ''}

DOCUMENT CONTENT:
${documentContent}

Please analyze this medical document and provide a comprehensive clinical summary following the exact JSON structure specified.
`;

    console.log("Calling ApneDoctors AI for document analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: DOCUMENT_ANALYSIS_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Document analysis completed successfully");
    
    const content = data.choices?.[0]?.message?.content;
    let analysisResult;
    
    try {
      analysisResult = JSON.parse(content);
      // Add metadata
      analysisResult.analysisId = crypto.randomUUID();
      analysisResult.analyzedAt = new Date().toISOString();
      analysisResult.documentType = documentType;
    } catch {
      analysisResult = {
        analysisId: crypto.randomUUID(),
        analyzedAt: new Date().toISOString(),
        error: "Unable to parse structured analysis",
        rawContent: content,
        safetyStatement: "Document analysis encountered an issue. Please consult a healthcare professional."
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in document-analysis function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      analysisId: crypto.randomUUID(),
      analyzedAt: new Date().toISOString(),
      safetyStatement: "Unable to analyze document. Please consult a healthcare professional."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
