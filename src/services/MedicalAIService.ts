import { supabase } from "@/integrations/supabase/client";

// Types for API responses
export interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
  severity: "low" | "medium" | "high";
  description: string;
}

export interface ObjectDetectionResult {
  detections: Detection[];
  bodyPartDetected: string | null;
  overallAssessment: string;
  medicalConcerns: string[];
  recommendations: string[];
}

export interface PoseAnalysisResult {
  poseAnalysis: {
    overallPosture: "good" | "fair" | "poor";
    postureScore: number;
    alignment: string;
  };
  keypoints: Array<{
    name: string;
    position: [number, number];
    confidence: number;
    angle: number | null;
    status: "normal" | "concern" | "critical";
  }>;
  jointAnalysis: Array<{
    joint: string;
    angle: number;
    normalRange: [number, number];
    status: string;
    concern: string | null;
  }>;
  asymmetryFindings: Array<{
    area: string;
    description: string;
    severity: "mild" | "moderate" | "severe";
  }>;
  movementRecommendations: string[];
  medicalFlags: string[];
  overallAssessment: string;
}

export interface SymptomAnalysisResult {
  triageLevel: number;
  triageLevelName: string;
  triageColor: "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE";
  confidenceScore: number;
  chiefComplaint: string;
  symptomAnalysis: {
    primarySymptoms: string[];
    secondarySymptoms: string[];
    duration: string;
    severity: string;
    progression: string;
  };
  possibleConditions: Array<{
    condition: string;
    probability: string;
    description: string;
  }>;
  redFlags: string[];
  recommendedActions: string[];
  questionsToAsk: string[];
  urgencyDescription: string;
  disclaimer: string;
}

export interface RealtimeTriageResult {
  response: string;
  triageLevel: "GREEN" | "YELLOW" | "ORANGE" | "RED";
  triageScore: number;
  confidence: number;
  extractedInfo: {
    symptoms: string[];
    bodyPart: string | null;
    duration: string | null;
    severity: string | null;
    redFlags: string[];
  };
  suggestedQuestions: string[];
  actionNeeded: "continue_conversation" | "recommend_urgent_care" | "recommend_emergency" | "assessment_complete";
  visionInsights: string | null;
}

export interface EmergencyCheckResult {
  isEmergency: boolean;
  severity: "critical" | "high" | "medium" | "low" | "unknown";
  triageLevel: string;
  foundKeywords: string[];
  matchedPatternCount: number;
  recommendation: string;
  callEmergencyServices: boolean;
}

export interface ComprehensiveReport {
  reportId: string;
  generatedAt: string;
  patientSummary: {
    chiefComplaint: string;
    presentingSymptoms: string[];
    affectedArea: string;
    duration: string;
    painLevel: number;
  };
  clinicalFindings: {
    visualAssessment: {
      findings: string[];
      abnormalities: string[];
      severity: string;
    };
    postureAssessment: {
      findings: string[];
      limitations: string[];
    };
    symptomCorrelation: string;
  };
  triageAssessment: {
    level: number;
    category: string;
    color: string;
    rationale: string;
  };
  differentialDiagnosis: Array<{
    condition: string;
    likelihood: string;
    supportingEvidence: string[];
    additionalTestsNeeded: string[];
  }>;
  redFlags: Array<{
    flag: string;
    significance: string;
    action: string;
  }>;
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    followUp: string[];
    selfCare: string[];
  };
  medicationConsiderations: string[];
  whenToSeekEmergencyCare: string[];
  prognosis: string;
  disclaimer: string;
}

// API Service class
export class MedicalAIService {
  /**
   * Perform YOLO-style object detection on a medical image
   */
  static async detectObjects(
    image: string,
    sessionId?: string
  ): Promise<ObjectDetectionResult> {
    const { data, error } = await supabase.functions.invoke("ai-object-detection", {
      body: { image, sessionId },
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Analyze body pose and movement (MediaPipe-style)
   */
  static async analyzePose(
    image: string,
    sessionId?: string,
    analysisType?: string
  ): Promise<PoseAnalysisResult> {
    const { data, error } = await supabase.functions.invoke("ai-pose-analysis", {
      body: { image, sessionId, analysisType },
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Analyze symptoms and provide triage assessment
   */
  static async analyzeSymptoms(params: {
    symptoms: string;
    painLevel?: number;
    duration?: string;
    bodyPart?: string;
    additionalInfo?: string;
    patientHistory?: string;
  }): Promise<SymptomAnalysisResult> {
    const { data, error } = await supabase.functions.invoke("ai-symptom-analysis", {
      body: params,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Real-time conversational triage
   */
  static async realtimeTriage(params: {
    conversationHistory?: Array<{ role: string; content: string }>;
    currentMessage: string;
    visionContext?: any;
    sessionId?: string;
  }): Promise<RealtimeTriageResult> {
    const { data, error } = await supabase.functions.invoke("ai-realtime-triage", {
      body: params,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Quick emergency screening (no AI call - instant response)
   */
  static async checkEmergency(params: {
    text?: string;
    symptoms?: string | string[];
  }): Promise<EmergencyCheckResult> {
    const { data, error } = await supabase.functions.invoke("ai-emergency-check", {
      body: params,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Generate comprehensive medical report
   */
  static async generateReport(params: {
    patientInfo?: any;
    symptomAnalysis?: SymptomAnalysisResult;
    visionAnalysis?: ObjectDetectionResult;
    poseAnalysis?: PoseAnalysisResult;
    sessionId?: string;
    assessmentId?: string;
  }): Promise<ComprehensiveReport> {
    const { data, error } = await supabase.functions.invoke("ai-comprehensive-report", {
      body: params,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Perform complete analysis pipeline
   */
  static async fullAnalysis(params: {
    image?: string;
    symptoms: string;
    painLevel?: number;
    duration?: string;
    bodyPart?: string;
    additionalInfo?: string;
    sessionId?: string;
    assessmentId?: string;
  }): Promise<{
    emergencyCheck: EmergencyCheckResult;
    symptomAnalysis: SymptomAnalysisResult;
    objectDetection?: ObjectDetectionResult;
    poseAnalysis?: PoseAnalysisResult;
    report: ComprehensiveReport;
  }> {
    // Step 1: Emergency check (instant)
    const emergencyCheck = await this.checkEmergency({
      text: params.symptoms,
      symptoms: params.additionalInfo,
    });

    // If critical emergency, return immediately
    if (emergencyCheck.severity === "critical") {
      return {
        emergencyCheck,
        symptomAnalysis: {
          triageLevel: 1,
          triageLevelName: "EMERGENT",
          triageColor: "RED",
          confidenceScore: 100,
          chiefComplaint: params.symptoms,
          symptomAnalysis: {
            primarySymptoms: emergencyCheck.foundKeywords,
            secondarySymptoms: [],
            duration: params.duration || "unknown",
            severity: "severe",
            progression: "unknown",
          },
          possibleConditions: [],
          redFlags: emergencyCheck.foundKeywords,
          recommendedActions: ["CALL 911 IMMEDIATELY"],
          questionsToAsk: [],
          urgencyDescription: emergencyCheck.recommendation,
          disclaimer: "This is a potential emergency. Call emergency services immediately.",
        },
        report: {
          reportId: crypto.randomUUID(),
          generatedAt: new Date().toISOString(),
          patientSummary: {
            chiefComplaint: params.symptoms,
            presentingSymptoms: emergencyCheck.foundKeywords,
            affectedArea: params.bodyPart || "unknown",
            duration: params.duration || "unknown",
            painLevel: params.painLevel || 10,
          },
          clinicalFindings: {
            visualAssessment: { findings: [], abnormalities: [], severity: "severe" },
            postureAssessment: { findings: [], limitations: [] },
            symptomCorrelation: "Emergency symptoms detected",
          },
          triageAssessment: {
            level: 1,
            category: "EMERGENT",
            color: "RED",
            rationale: emergencyCheck.recommendation,
          },
          differentialDiagnosis: [],
          redFlags: emergencyCheck.foundKeywords.map((kw) => ({
            flag: kw,
            significance: "Critical",
            action: "Seek immediate emergency care",
          })),
          recommendations: {
            immediate: ["Call 911 or go to emergency room immediately"],
            shortTerm: [],
            followUp: [],
            selfCare: [],
          },
          medicationConsiderations: [],
          whenToSeekEmergencyCare: ["NOW - This is a potential emergency"],
          prognosis: "Requires immediate medical evaluation",
          disclaimer: "EMERGENCY: Call emergency services immediately.",
        },
      };
    }

    // Step 2: Parallel analysis
    const [symptomAnalysis, objectDetection, poseAnalysis] = await Promise.all([
      this.analyzeSymptoms({
        symptoms: params.symptoms,
        painLevel: params.painLevel,
        duration: params.duration,
        bodyPart: params.bodyPart,
        additionalInfo: params.additionalInfo,
      }),
      params.image ? this.detectObjects(params.image, params.sessionId) : Promise.resolve(undefined),
      params.image ? this.analyzePose(params.image, params.sessionId) : Promise.resolve(undefined),
    ]);

    // Step 3: Generate comprehensive report
    const report = await this.generateReport({
      patientInfo: {
        symptoms: params.symptoms,
        painLevel: params.painLevel,
        duration: params.duration,
        bodyPart: params.bodyPart,
        additionalInfo: params.additionalInfo,
      },
      symptomAnalysis,
      visionAnalysis: objectDetection,
      poseAnalysis,
      sessionId: params.sessionId,
      assessmentId: params.assessmentId,
    });

    return {
      emergencyCheck,
      symptomAnalysis,
      objectDetection,
      poseAnalysis,
      report,
    };
  }
}

export default MedicalAIService;
