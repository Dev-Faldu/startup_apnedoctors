import { useAssessment } from '@/hooks/useAssessment';
import { SymptomForm } from '@/components/assessment/SymptomForm';
import { CameraCapture } from '@/components/assessment/CameraCapture';
import { AnalysisView } from '@/components/assessment/AnalysisView';
import { ReportView } from '@/components/assessment/ReportView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Assessment() {
  const {
    currentStep,
    patientInfo,
    triageResult,
    visionResult,
    report,
    isLoading,
    submitSymptoms,
    submitVisionAnalysis,
    generateReport,
    resetAssessment,
    goToStep
  } = useAssessment();

  const renderStep = () => {
    switch (currentStep) {
      case 'symptoms':
        return <SymptomForm onSubmit={submitSymptoms} isLoading={isLoading} />;
      case 'camera':
        return (
          <CameraCapture
            onSubmit={submitVisionAnalysis}
            isLoading={isLoading}
            bodyPart={patientInfo?.location || 'affected area'}
            triageResult={triageResult}
          />
        );
      case 'analysis':
        return (
          <AnalysisView
            triageResult={triageResult}
            visionResult={visionResult}
            onGenerateReport={generateReport}
            isLoading={isLoading}
          />
        );
      case 'report':
        return report ? <ReportView report={report} onReset={resetAssessment} /> : null;
      default:
        return null;
    }
  };

  const canGoBack = currentStep !== 'symptoms';
  
  const handleBack = () => {
    switch (currentStep) {
      case 'camera':
        goToStep('symptoms');
        break;
      case 'analysis':
        goToStep('camera');
        break;
      case 'report':
        goToStep('analysis');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Progress Bar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-border/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <Button variant="ghost" size="sm" onClick={handleBack} disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </Link>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep === 'symptoms' ? 1 : currentStep === 'camera' ? 2 : currentStep === 'analysis' ? 3 : 4} of 4
            </span>
          </div>
          <div className="w-full h-1.5 bg-background/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{ 
                width: `${
                  currentStep === 'symptoms' ? 25 : 
                  currentStep === 'camera' ? 50 : 
                  currentStep === 'analysis' ? 75 : 100
                }%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-40 pb-12">
        <div className="container mx-auto px-4">
          {renderStep()}
        </div>
      </main>

      <Footer />
    </div>
  );
}
