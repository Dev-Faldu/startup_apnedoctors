export interface LiveMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VisionDetection {
  type: 'swelling' | 'redness' | 'bruising' | 'deformity' | 'wound' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  location: string;
  confidence: number;
}

export interface LiveVisionResult {
  detections: VisionDetection[];
  overallAssessment: string;
  concernLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  disclaimer: string;
}

export interface LiveTriageResult {
  response: string;
  triageLevel: 'GREEN' | 'AMBER' | 'RED' | null;
  extractedInfo: {
    symptoms?: string[];
    duration?: string;
    severity?: string;
    bodyPart?: string;
    redFlags?: string[];
  };
  nextQuestion?: string;
  shouldEscalate?: boolean;
  conversationComplete?: boolean;
}

export interface LiveSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: LiveMessage[];
  visionResults: LiveVisionResult[];
  finalTriage?: LiveTriageResult;
}
