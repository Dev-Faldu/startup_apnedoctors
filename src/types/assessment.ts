export interface PatientInfo {
  symptoms: string;
  painLevel: number;
  duration: string;
  location: string;
  additionalInfo?: string;
}

export interface TriageResult {
  triageLevel: number;
  urgencyDescription: string;
  possibleConditions: string[];
  recommendedActions: string[];
  redFlags: string[];
  confidenceScore: number;
  shouldSeekEmergencyCare: boolean;
  followUpTimeframe: string;
  disclaimer: string;
  error?: string;
}

export interface VisionAnalysisResult {
  inflammationScore: number;
  rednessDetected: boolean;
  rednessLevel: 'none' | 'mild' | 'moderate' | 'severe';
  swellingDetected: boolean;
  swellingLevel: 'none' | 'mild' | 'moderate' | 'severe';
  bruisingDetected: boolean;
  visibleDeformity: boolean;
  affectedArea: string;
  possibleInjuryTypes: string[];
  urgencyLevel: number;
  confidenceScore: number;
  observations: string[];
  recommendedAction: string;
  disclaimer: string;
  error?: string;
}

export interface MedicalReport {
  reportId: string;
  generatedAt: string;
  patientSummary: {
    chiefComplaint: string;
    affectedArea: string;
    duration: string;
    painLevel: number;
  };
  clinicalFindings: {
    visualAssessment: {
      inflammationScore: number;
      redness: string;
      swelling: string;
      otherFindings: string[];
    };
    symptomAnalysis: string[];
  };
  triageAssessment: {
    level: number;
    urgency: string;
    possibleConditions: string[];
    differentialDiagnosis: string[];
  };
  recommendations: {
    immediateActions: string[];
    treatmentSuggestions: string[];
    followUpPlan: string;
    specialistReferral: boolean;
    specialistType: string | null;
  };
  redFlags: string[];
  confidenceMetrics: {
    overallConfidence: number;
    visualAnalysisConfidence: number;
    symptomAnalysisConfidence: number;
  };
  disclaimer: string;
  nextSteps: string[];
  error?: string;
}

export type AssessmentStep = 'symptoms' | 'camera' | 'analysis' | 'report';
