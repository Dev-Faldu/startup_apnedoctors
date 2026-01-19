export type DocumentType = 
  | 'lab_report'
  | 'radiology_report'
  | 'discharge_summary'
  | 'prescription'
  | 'pathology_report'
  | 'ecg_report'
  | 'general_medical'
  | 'unknown';

export interface KeyFinding {
  finding: string;
  value: string;
  referenceRange: string;
  status: 'normal' | 'abnormal_high' | 'abnormal_low' | 'critical';
  clinicalRelevance: 'low' | 'moderate' | 'high';
}

export interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  rationale: string;
}

export interface RiskFlag {
  flag: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  action: string;
  requiresImmediateAttention: boolean;
}

export interface DocumentAnalysisResult {
  analysisId: string;
  analyzedAt: string;
  documentType: DocumentType;
  
  documentOverview: {
    documentType: string;
    dateOfTest: string;
    bodySystemsInvolved: string[];
    source: string;
  };
  
  keyFindings: KeyFinding[];
  radiologyImpressions: string | null;
  clinicalContextSummary: string;
  
  diagnosis: {
    primaryDiagnosis: string;
    differentialDiagnoses: string[];
    confidence: number;
    supportingEvidence: string[];
  };
  
  treatmentRecommendations: {
    medications: Medication[];
    procedures: string[];
    lifestyle: string[];
    monitoring: string[];
  };
  
  riskAndAttentionFlags: RiskFlag[];
  
  timelineAndProgression: {
    acuteOrChronic: 'acute' | 'chronic' | 'unclear';
    progressionIndicators: string[];
    comparisonNotes: string;
  };
  
  questionsForDoctor: string[];
  
  confidenceAndLimitations: {
    whatDocumentSupports: string[];
    whatCannotBeConcluded: string[];
    whereHumanJudgmentRequired: string[];
    overallConfidence: number;
  };
  
  executiveSummary: string;
  safetyStatement: string;
  
  // Error state
  error?: string;
  rawContent?: string;
}

export interface DocumentUploadState {
  file: File | null;
  documentType: DocumentType;
  patientContext: string;
  isAnalyzing: boolean;
  error: string | null;
  result: DocumentAnalysisResult | null;
}
