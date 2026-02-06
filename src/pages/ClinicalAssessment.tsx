import { useClinicalAssessment } from '@/hooks/useClinicalAssessment';
import { ClinicalAssessmentLayout } from '@/components/clinical-assessment/ClinicalAssessmentLayout';
import { WelcomeStep } from '@/components/clinical-assessment/steps/WelcomeStep';
import { ConsentStep } from '@/components/clinical-assessment/steps/ConsentStep';
import { BodyLocationStep } from '@/components/clinical-assessment/steps/BodyLocationStep';
import { PainAssessmentStep } from '@/components/clinical-assessment/steps/PainAssessmentStep';
import { DurationStep } from '@/components/clinical-assessment/steps/DurationStep';
import { SymptomsStep } from '@/components/clinical-assessment/steps/SymptomsStep';
import { ContextStep } from '@/components/clinical-assessment/steps/ContextStep';
import { ReviewStep } from '@/components/clinical-assessment/steps/ReviewStep';
import { VisualConsentStep } from '@/components/clinical-assessment/steps/VisualConsentStep';
import { CameraCapture } from '@/components/assessment/CameraCapture';
import { AnalysisView } from '@/components/assessment/AnalysisView';
import { ReportView } from '@/components/assessment/ReportView';
import { useState } from 'react';
import { MedicalReport } from '@/types/assessment';
import type { ClinicalAssessmentStep } from '@/types/clinical-assessment';

export default function ClinicalAssessment() {
  const {
    state,
    updateIntakeData,
    recordConsent,
    goToStep,
    submitForTriage,
    submitVisualScan,
    generateReport,
    resetAssessment,
  } = useClinicalAssessment();

  const [report, setReport] = useState<MedicalReport | null>(null);

  const hasEmergencyFlag = state.riskFlags.some(f => f.type === 'emergency');

  const handleBack = () => {
    const stepOrder = ['welcome', 'consent', 'body-location', 'pain-assessment', 'duration', 'symptoms', 'context', 'review', 'visual-consent', 'visual-scan', 'analysis', 'report'];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      goToStep(stepOrder[currentIndex - 1] as ClinicalAssessmentStep);
    }
  };

  const handleGenerateReport = async () => {
    const generatedReport = await generateReport();
    if (generatedReport) {
      setReport(generatedReport);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'welcome':
        return <WelcomeStep onContinue={() => goToStep('consent')} />;
      
      case 'consent':
        return (
          <ConsentStep 
            onContinue={() => goToStep('body-location')}
            onRecordConsent={recordConsent}
          />
        );
      
      case 'body-location':
        return (
          <BodyLocationStep
            value={state.intakeData.bodyLocation}
            onContinue={(location, specific) => {
              updateIntakeData({ bodyLocation: location, bodyLocationSpecific: specific });
              goToStep('pain-assessment');
            }}
          />
        );
      
      case 'pain-assessment':
        return (
          <PainAssessmentStep
            painLevel={state.intakeData.painLevel}
            painPattern={state.intakeData.painPattern}
            painQuality={state.intakeData.painQuality}
            onContinue={(painLevel, painPattern, painQuality) => {
              updateIntakeData({ painLevel, painPattern, painQuality });
              goToStep('duration');
            }}
          />
        );
      
      case 'duration':
        return (
          <DurationStep
            value={state.intakeData.duration}
            onsetType={state.intakeData.onsetType}
            onContinue={(duration, onsetType) => {
              updateIntakeData({ duration, onsetType });
              goToStep('symptoms');
            }}
          />
        );
      
      case 'symptoms':
        return (
          <SymptomsStep
            value={state.intakeData.symptoms}
            additionalInfo={state.intakeData.additionalInfo}
            onContinue={(symptoms, additionalInfo) => {
              updateIntakeData({ symptoms, additionalInfo });
              goToStep('context');
            }}
          />
        );
      
      case 'context':
        return (
          <ContextStep
            value={state.intakeData.contextFactors}
            onContinue={(contextFactors) => {
              updateIntakeData({ contextFactors });
              goToStep('review');
            }}
          />
        );
      
      case 'review':
        return (
          <ReviewStep
            intakeData={state.intakeData}
            onEdit={(step) => goToStep(step as ClinicalAssessmentStep)}
            onSubmit={submitForTriage}
            isLoading={state.isLoading}
          />
        );
      
      case 'visual-consent':
        return (
          <VisualConsentStep
            triageLevel={state.triageResult?.triageLevel}
            onAccept={() => goToStep('visual-scan')}
            onSkip={() => goToStep('analysis')}
          />
        );
      
      case 'visual-scan':
        return (
          <CameraCapture
            onSubmit={(imageBase64) => submitVisualScan(imageBase64)}
            isLoading={state.isLoading}
            bodyPart={state.intakeData.bodyLocation || 'affected area'}
            triageResult={state.triageResult}
          />
        );
      
      case 'analysis':
        return (
          <AnalysisView
            triageResult={state.triageResult}
            visionResult={state.visualScanMetadata}
            onGenerateReport={handleGenerateReport}
            isLoading={state.isLoading}
          />
        );
      
      case 'report':
        return report ? (
          <ReportView report={report} onReset={resetAssessment} />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <ClinicalAssessmentLayout
      currentStep={state.currentStep}
      onBack={handleBack}
      canGoBack={state.currentStep !== 'welcome'}
      isLoading={state.isLoading}
      hasEmergencyFlag={hasEmergencyFlag}
    >
      {renderStep()}
    </ClinicalAssessmentLayout>
  );
}
