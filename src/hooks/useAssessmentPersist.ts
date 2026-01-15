import { supabase } from '@/integrations/supabase/client';
import { PatientInfo, TriageResult, VisionAnalysisResult, MedicalReport } from '@/types/assessment';
import type { Json } from '@/integrations/supabase/types';

export async function saveAssessment(
  patientInfo: PatientInfo,
  triageResult: TriageResult | null,
  visionResult: VisionAnalysisResult | null
): Promise<string | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    // Create assessment record with patient_id = auth.uid()
    const insertData = {
      patient_id: user.id,
      body_part: patientInfo.location,
      symptoms: patientInfo.symptoms,
      pain_level: patientInfo.painLevel,
      duration: patientInfo.duration,
      additional_info: patientInfo.additionalInfo,
      ai_triage_output: triageResult as unknown as Json,
      ai_vision_output: visionResult as unknown as Json,
      status: 'analyzing' as const
    };

    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert(insertData)
      .select()
      .single();

    if (assessmentError) {
      console.error('Error saving assessment:', assessmentError);
      return null;
    }

    return assessment.id;
  } catch (err) {
    console.error('Error in saveAssessment:', err);
    return null;
  }
}

export async function saveTriageReport(
  assessmentId: string,
  report: MedicalReport,
  triageResult: TriageResult
): Promise<boolean> {
  try {
    // Determine risk level based on triage level
    let riskLevel: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
    if (triageResult.triageLevel >= 4) {
      riskLevel = 'RED';
    } else if (triageResult.triageLevel >= 2) {
      riskLevel = 'AMBER';
    }

    // Insert triage report
    const { error: reportError } = await supabase
      .from('triage_reports')
      .insert({
        assessment_id: assessmentId,
        risk_level: riskLevel,
        triage_level: triageResult.triageLevel,
        medical_summary: report.triageAssessment?.urgency || triageResult.urgencyDescription,
        chief_complaint: report.patientSummary?.chiefComplaint,
        possible_conditions: triageResult.possibleConditions,
        recommendations: triageResult.recommendedActions,
        red_flags: triageResult.redFlags,
        confidence_score: triageResult.confidenceScore
      });

    if (reportError) {
      console.error('Error saving triage report:', reportError);
      return false;
    }

    // Update assessment status
    await supabase
      .from('assessments')
      .update({ status: 'completed' })
      .eq('id', assessmentId);

    return true;
  } catch (err) {
    console.error('Error in saveTriageReport:', err);
    return false;
  }
}

export async function updateAssessmentStatus(
  assessmentId: string,
  status: 'pending' | 'analyzing' | 'completed' | 'reviewed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('assessments')
      .update({ status })
      .eq('id', assessmentId);

    return !error;
  } catch {
    return false;
  }
}
