import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PatientInfo, TriageResult, VisionAnalysisResult, MedicalReport, AssessmentStep } from '@/types/assessment';
import { toast } from 'sonner';

export function useAssessment() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('symptoms');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const submitSymptoms = useCallback(async (info: PatientInfo) => {
    setIsLoading(true);
    setPatientInfo(info);
    
    try {
      console.log('Submitting symptoms for triage analysis...');
      const { data, error } = await supabase.functions.invoke('ai-triage', {
        body: info
      });

      if (error) {
        console.error('Triage error:', error);
        toast.error('Failed to analyze symptoms. Please try again.');
        throw error;
      }

      console.log('Triage result:', data);
      setTriageResult(data);
      setCurrentStep('camera');
      toast.success('Symptom analysis complete!');
    } catch (err) {
      console.error('Error in symptom submission:', err);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitVisionAnalysis = useCallback(async (imageBase64: string | null, bodyPart: string) => {
    setIsLoading(true);
    setCapturedImage(imageBase64);
    
    try {
      console.log('Submitting image for vision analysis...');
      const { data, error } = await supabase.functions.invoke('ai-vision-analysis', {
        body: {
          imageBase64,
          bodyPart,
          additionalContext: patientInfo?.symptoms
        }
      });

      if (error) {
        console.error('Vision analysis error:', error);
        toast.error('Failed to analyze image. Please try again.');
        throw error;
      }

      console.log('Vision result:', data);
      setVisionResult(data);
      setCurrentStep('analysis');
      toast.success('Visual analysis complete!');
    } catch (err) {
      console.error('Error in vision analysis:', err);
      toast.error('Image analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [patientInfo]);

  const generateReport = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('Generating medical report...');
      const { data, error } = await supabase.functions.invoke('medical-report', {
        body: {
          patientInfo,
          triageData: triageResult,
          visionData: visionResult
        }
      });

      if (error) {
        console.error('Report generation error:', error);
        toast.error('Failed to generate report. Please try again.');
        throw error;
      }

      console.log('Report generated:', data);
      setReport(data);
      setCurrentStep('report');
      toast.success('Medical report generated!');
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Report generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [patientInfo, triageResult, visionResult]);

  const resetAssessment = useCallback(() => {
    setCurrentStep('symptoms');
    setPatientInfo(null);
    setTriageResult(null);
    setVisionResult(null);
    setReport(null);
    setCapturedImage(null);
  }, []);

  const goToStep = useCallback((step: AssessmentStep) => {
    setCurrentStep(step);
  }, []);

  return {
    currentStep,
    patientInfo,
    triageResult,
    visionResult,
    report,
    isLoading,
    capturedImage,
    submitSymptoms,
    submitVisionAnalysis,
    generateReport,
    resetAssessment,
    goToStep
  };
}
