// =====================================================
// CLINICAL-GRADE ASSESSMENT TYPES
// Hospital-ready, auditable, regulation-compliant
// =====================================================

export interface ClinicalIntakeData {
  // Step 1: Body Location
  bodyLocation: string;
  bodyLocationSpecific?: string;
  
  // Step 2: Pain Assessment
  painLevel: number;
  painPattern: 'constant' | 'intermittent' | 'activity_related' | 'rest_related' | 'variable';
  painQuality: 'sharp' | 'dull' | 'burning' | 'throbbing' | 'aching' | 'stabbing' | 'radiating' | 'cramping';
  
  // Step 3: Duration
  duration: string;
  onsetType: 'sudden' | 'gradual' | 'unknown';
  
  // Step 4: Symptoms
  symptoms: string;
  normalizedSymptoms?: NormalizedSymptom[];
  
  // Step 5: Context Factors
  contextFactors: ContextFactors;
  
  // Step 6: Additional Info
  additionalInfo?: string;
}

export interface NormalizedSymptom {
  raw: string;
  normalized: string;
  category: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number;
}

export interface ContextFactors {
  hasRecentTrauma: boolean;
  hasFever: boolean;
  hasSwelling: boolean;
  hasNumbness: boolean;
  hasLimitedMobility: boolean;
  hasPreviousInjury: boolean;
  previousInjuryDetails?: string;
  currentMedications?: string[];
  allergies?: string[];
  preExistingConditions?: string[];
  recentActivities?: string;
}

export interface RiskFlag {
  id: string;
  type: 'emergency' | 'urgent' | 'warning' | 'caution' | 'info';
  code: string;
  description: string;
  detectedFrom: string;
  confidence: number;
  requiresEscalation: boolean;
}

export interface AIReasoningTrace {
  traceType: 'symptom_normalization' | 'risk_detection' | 'triage_logic' | 'vision_analysis' | 'report_generation';
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  modelUsed: string;
  confidenceScore: number;
  uncertaintyFactors: string[];
  contributingRules: string[];
  processingTimeMs: number;
}

export interface ExplainabilityData {
  whyFlagged: string[];
  influencingData: string[];
  unknownFactors: string[];
  confidenceBreakdown: {
    category: string;
    score: number;
    reason: string;
  }[];
}

export interface ClinicalTriageOutput {
  triageLevel: number;
  urgencyDescription: string;
  possibleConditions: string[];
  recommendedActions: string[];
  redFlags: RiskFlag[];
  confidenceScore: number;
  shouldSeekEmergencyCare: boolean;
  followUpTimeframe: string;
  explainability: ExplainabilityData;
  aiNote: string;
  disclaimer: string;
}

export interface VisualScanMetadata {
  scanTimestamp: string;
  imageHash?: string;
  imageDimensions?: { width: number; height: number };
  bodyRegionDetected: string;
  detectedFeatures: {
    redness: { detected: boolean; level: string; confidence: number };
    swelling: { detected: boolean; level: string; confidence: number };
    bruising: { detected: boolean; level: string; confidence: number };
    asymmetry: { detected: boolean; score: number };
    discoloration: { detected: boolean; type: string };
  };
  inflammationIndicators: {
    score: number;
    areas: string[];
  };
  qualityScore: number;
  processingNotes: string[];
}

export interface ConsentRecord {
  type: 'terms' | 'data_processing' | 'visual_scan' | 'ai_assessment' | 'data_sharing';
  given: boolean;
  timestamp: string;
}

export interface ClinicalAssessmentState {
  sessionId: string;
  currentStep: ClinicalAssessmentStep;
  intakeData: Partial<ClinicalIntakeData>;
  consents: ConsentRecord[];
  triageResult: ClinicalTriageOutput | null;
  visualScanMetadata: VisualScanMetadata | null;
  riskFlags: RiskFlag[];
  reasoningTraces: AIReasoningTrace[];
  isLoading: boolean;
  error: string | null;
}

export type ClinicalAssessmentStep = 
  | 'welcome'
  | 'consent'
  | 'body-location'
  | 'pain-assessment'
  | 'duration'
  | 'symptoms'
  | 'context'
  | 'review'
  | 'visual-consent'
  | 'visual-scan'
  | 'analysis'
  | 'report';

export const BODY_LOCATIONS = [
  { value: 'knee', label: 'Knee', icon: '🦵' },
  { value: 'shoulder', label: 'Shoulder', icon: '💪' },
  { value: 'hip', label: 'Hip', icon: '🦴' },
  { value: 'ankle', label: 'Ankle', icon: '🦶' },
  { value: 'wrist', label: 'Wrist', icon: '✋' },
  { value: 'elbow', label: 'Elbow', icon: '💪' },
  { value: 'lower-back', label: 'Lower Back', icon: '🔙' },
  { value: 'upper-back', label: 'Upper Back', icon: '🔙' },
  { value: 'neck', label: 'Neck', icon: '👤' },
  { value: 'hand', label: 'Hand', icon: '🖐️' },
  { value: 'foot', label: 'Foot', icon: '🦶' },
  { value: 'other', label: 'Other', icon: '📍' },
] as const;

export const DURATION_OPTIONS = [
  { value: 'less-than-24h', label: 'Less than 24 hours', severity: 'acute' },
  { value: '1-3-days', label: '1-3 days', severity: 'acute' },
  { value: '3-7-days', label: '3-7 days', severity: 'subacute' },
  { value: '1-2-weeks', label: '1-2 weeks', severity: 'subacute' },
  { value: '2-4-weeks', label: '2-4 weeks', severity: 'subacute' },
  { value: '1-3-months', label: '1-3 months', severity: 'chronic' },
  { value: 'more-than-3-months', label: 'More than 3 months', severity: 'chronic' },
] as const;

export const PAIN_PATTERNS = [
  { value: 'constant', label: 'Constant', description: 'Pain is always present' },
  { value: 'intermittent', label: 'Intermittent', description: 'Pain comes and goes' },
  { value: 'activity_related', label: 'Activity-Related', description: 'Pain occurs during movement' },
  { value: 'rest_related', label: 'Rest-Related', description: 'Pain is worse at rest' },
  { value: 'variable', label: 'Variable', description: 'Pain pattern changes' },
] as const;

export const PAIN_QUALITIES = [
  { value: 'sharp', label: 'Sharp', description: 'Sudden, intense pain' },
  { value: 'dull', label: 'Dull', description: 'Mild, continuous ache' },
  { value: 'burning', label: 'Burning', description: 'Hot, stinging sensation' },
  { value: 'throbbing', label: 'Throbbing', description: 'Pulsating pain' },
  { value: 'aching', label: 'Aching', description: 'Deep, persistent pain' },
  { value: 'stabbing', label: 'Stabbing', description: 'Sudden, piercing pain' },
  { value: 'radiating', label: 'Radiating', description: 'Pain that spreads' },
  { value: 'cramping', label: 'Cramping', description: 'Muscle tightening pain' },
] as const;

// Emergency keywords for immediate escalation
export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'difficulty breathing',
  'severe bleeding',
  'loss of consciousness',
  'stroke',
  'heart attack',
  'paralysis',
  'severe allergic reaction',
  'anaphylaxis',
  'seizure',
  'suicidal',
  'overdose',
  'can\'t move',
  'can\'t feel',
  'vision loss',
  'sudden weakness',
  'slurred speech',
  'crushing pain',
] as const;
