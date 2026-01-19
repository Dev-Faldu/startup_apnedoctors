import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ClinicalAssessmentState,
  ClinicalAssessmentStep,
  ClinicalIntakeData,
  ConsentRecord,
  RiskFlag,
  EMERGENCY_KEYWORDS,
} from '@/types/clinical-assessment';
import type { Json } from '@/integrations/supabase/types';

const INITIAL_STATE: ClinicalAssessmentState = {
  sessionId: crypto.randomUUID(),
  currentStep: 'welcome',
  intakeData: {},
  consents: [],
  triageResult: null,
  visualScanMetadata: null,
  riskFlags: [],
  reasoningTraces: [],
  isLoading: false,
  error: null,
};

export function useClinicalAssessment() {
  const [state, setState] = useState<ClinicalAssessmentState>(INITIAL_STATE);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Detect emergency keywords in text
  const detectEmergencyKeywords = useCallback((text: string): string[] => {
    const lowerText = text.toLowerCase();
    return EMERGENCY_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }, []);

  // Record consent
  const recordConsent = useCallback(async (
    type: ConsentRecord['type'],
    given: boolean
  ) => {
    const consent: ConsentRecord = {
      type,
      given,
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      consents: [...prev.consents.filter(c => c.type !== type), consent],
    }));

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_consent_logs').insert({
          user_id: user.id,
          consent_type: type,
          consent_given: given,
          user_agent: navigator.userAgent,
        });
      }
    } catch (err) {
      console.error('Failed to save consent:', err);
    }
  }, []);

  // Update intake data
  const updateIntakeData = useCallback((
    data: Partial<ClinicalIntakeData>
  ) => {
    setState(prev => ({
      ...prev,
      intakeData: { ...prev.intakeData, ...data },
    }));

    // Check for emergency keywords in symptoms
    if (data.symptoms) {
      const emergencyKeywords = detectEmergencyKeywords(data.symptoms);
      if (emergencyKeywords.length > 0) {
        const emergencyFlags: RiskFlag[] = emergencyKeywords.map(keyword => ({
          id: crypto.randomUUID(),
          type: 'emergency',
          code: 'EMERGENCY_KEYWORD_DETECTED',
          description: `Emergency keyword detected: "${keyword}"`,
          detectedFrom: 'symptom_input',
          confidence: 100,
          requiresEscalation: true,
        }));

        setState(prev => ({
          ...prev,
          riskFlags: [...prev.riskFlags, ...emergencyFlags],
        }));

        toast.error('⚠️ Emergency Indicator Detected', {
          description: 'If this is a medical emergency, please call emergency services immediately.',
          duration: 10000,
        });
      }
    }
  }, [detectEmergencyKeywords]);

  // Navigate to step
  const goToStep = useCallback((step: ClinicalAssessmentStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Submit symptoms for triage analysis
  const submitForTriage = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create assessment record
      const assessmentData = {
        patient_id: user?.id || null,
        body_part: state.intakeData.bodyLocation || '',
        symptoms: state.intakeData.symptoms || '',
        pain_level: state.intakeData.painLevel || 5,
        duration: state.intakeData.duration || '',
        additional_info: state.intakeData.additionalInfo || '',
        consent_given: state.consents.some(c => c.type === 'ai_assessment' && c.given),
        consent_timestamp: new Date().toISOString(),
        context_factors: state.intakeData.contextFactors as unknown as Json,
        normalized_symptoms: state.intakeData.normalizedSymptoms as unknown as Json,
        status: 'analyzing' as const,
      };

      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (assessmentError) throw assessmentError;
      setAssessmentId(assessment.id);

      // Call triage edge function
      const startTime = Date.now();
      const { data: triageResult, error: triageError } = await supabase.functions.invoke('ai-triage', {
        body: {
          symptoms: state.intakeData.symptoms,
          painLevel: state.intakeData.painLevel,
          duration: state.intakeData.duration,
          location: state.intakeData.bodyLocation,
          additionalInfo: state.intakeData.additionalInfo,
          contextFactors: state.intakeData.contextFactors,
          painPattern: state.intakeData.painPattern,
          painQuality: state.intakeData.painQuality,
        }
      });
      const processingTime = Date.now() - startTime;

      if (triageError) throw triageError;

      // Save reasoning trace
      await supabase.from('ai_reasoning_traces').insert({
        assessment_id: assessment.id,
        trace_type: 'triage_logic',
        input_data: state.intakeData as unknown as Json,
        output_data: triageResult as unknown as Json,
        model_used: 'gemini-2.5-flash',
        confidence_score: triageResult.confidenceScore,
        uncertainty_factors: triageResult.uncertaintyFactors || [],
        contributing_rules: triageResult.contributingRules || [],
        processing_time_ms: processingTime,
      });

      // Save risk flags
      if (triageResult.redFlags?.length > 0) {
        const riskFlagsToInsert = triageResult.redFlags.map((flag: string) => ({
          assessment_id: assessment.id,
          flag_type: 'warning' as const,
          flag_code: 'RED_FLAG',
          flag_description: flag,
          detected_from: 'ai_triage',
          confidence: triageResult.confidenceScore,
          requires_escalation: triageResult.shouldSeekEmergencyCare,
        }));
        await supabase.from('risk_flags').insert(riskFlagsToInsert);
      }

      setState(prev => ({
        ...prev,
        triageResult,
        isLoading: false,
        currentStep: 'visual-consent',
      }));

      toast.success('Symptom analysis complete');
    } catch (err) {
      console.error('Triage error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to analyze symptoms. Please try again.',
      }));
      toast.error('Analysis failed. Please try again.');
    }
  }, [state.intakeData, state.consents]);

  // Submit visual scan
  const submitVisualScan = useCallback(async (imageBase64: string | null) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Record visual consent
      await recordConsent('visual_scan', true);

      if (imageBase64) {
        const startTime = Date.now();
        const { data: visionResult, error: visionError } = await supabase.functions.invoke('ai-vision-analysis', {
          body: {
            imageBase64,
            bodyPart: state.intakeData.bodyLocation,
            additionalContext: state.intakeData.symptoms,
          }
        });
        const processingTime = Date.now() - startTime;

        if (visionError) throw visionError;

        // Save vision reasoning trace
        if (assessmentId) {
          await supabase.from('ai_reasoning_traces').insert({
            assessment_id: assessmentId,
            trace_type: 'vision_analysis',
            input_data: { bodyPart: state.intakeData.bodyLocation, hasImage: true } as unknown as Json,
            output_data: visionResult as unknown as Json,
            model_used: 'gemini-2.5-flash',
            confidence_score: visionResult.confidenceScore,
            uncertainty_factors: visionResult.uncertaintyFactors || [],
            processing_time_ms: processingTime,
          });

          // Save visual scan metadata
          await supabase.from('visual_scan_metadata').insert({
            assessment_id: assessmentId,
            body_region_detected: visionResult.affectedArea,
            detected_features: {
              redness: { detected: visionResult.rednessDetected, level: visionResult.rednessLevel },
              swelling: { detected: visionResult.swellingDetected, level: visionResult.swellingLevel },
              bruising: { detected: visionResult.bruisingDetected, level: 'unknown' },
            } as unknown as Json,
            inflammation_indicators: {
              score: visionResult.inflammationScore,
              areas: visionResult.observations || [],
            } as unknown as Json,
            quality_score: visionResult.confidenceScore,
            processing_notes: visionResult.observations || [],
          });
        }

        setState(prev => ({
          ...prev,
          visualScanMetadata: visionResult,
          isLoading: false,
          currentStep: 'analysis',
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStep: 'analysis',
        }));
      }

      toast.success('Visual analysis complete');
    } catch (err) {
      console.error('Vision analysis error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to analyze image. Please try again.',
      }));
      toast.error('Image analysis failed. Please try again.');
    }
  }, [state.intakeData, assessmentId, recordConsent]);

  // Generate final report
  const generateReport = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: report, error: reportError } = await supabase.functions.invoke('medical-report', {
        body: {
          patientInfo: {
            symptoms: state.intakeData.symptoms,
            painLevel: state.intakeData.painLevel,
            duration: state.intakeData.duration,
            location: state.intakeData.bodyLocation,
            additionalInfo: state.intakeData.additionalInfo,
          },
          triageData: state.triageResult,
          visionData: state.visualScanMetadata,
          contextFactors: state.intakeData.contextFactors,
        }
      });

      if (reportError) throw reportError;

      // Update assessment status
      if (assessmentId) {
        await supabase
          .from('assessments')
          .update({ 
            status: 'completed',
            intake_completed_at: new Date().toISOString(),
          })
          .eq('id', assessmentId);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        currentStep: 'report',
      }));

      return report;
    } catch (err) {
      console.error('Report generation error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to generate report. Please try again.',
      }));
      toast.error('Report generation failed. Please try again.');
      return null;
    }
  }, [state.intakeData, state.triageResult, state.visualScanMetadata, assessmentId]);

  // Reset assessment
  const resetAssessment = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      sessionId: crypto.randomUUID(),
    });
    setAssessmentId(null);
  }, []);

  return {
    state,
    assessmentId,
    updateIntakeData,
    recordConsent,
    goToStep,
    submitForTriage,
    submitVisualScan,
    generateReport,
    resetAssessment,
  };
}
