import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClinicalAssessmentStep } from '@/types/clinical-assessment';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ClinicalAssessmentLayoutProps {
  currentStep: ClinicalAssessmentStep;
  children: ReactNode;
  onBack?: () => void;
  canGoBack?: boolean;
  isLoading?: boolean;
  hasEmergencyFlag?: boolean;
}

const STEPS: { key: ClinicalAssessmentStep; label: string; number: number }[] = [
  { key: 'welcome', label: 'Welcome', number: 0 },
  { key: 'consent', label: 'Consent', number: 1 },
  { key: 'body-location', label: 'Location', number: 2 },
  { key: 'pain-assessment', label: 'Pain', number: 3 },
  { key: 'duration', label: 'Duration', number: 4 },
  { key: 'symptoms', label: 'Symptoms', number: 5 },
  { key: 'context', label: 'Context', number: 6 },
  { key: 'review', label: 'Review', number: 7 },
  { key: 'visual-consent', label: 'Visual Consent', number: 8 },
  { key: 'visual-scan', label: 'Visual Scan', number: 9 },
  { key: 'analysis', label: 'Analysis', number: 10 },
  { key: 'report', label: 'Report', number: 11 },
];

export function ClinicalAssessmentLayout({
  currentStep,
  children,
  onBack,
  canGoBack = true,
  isLoading = false,
  hasEmergencyFlag = false,
}: ClinicalAssessmentLayoutProps) {
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);
  const progress = Math.max(0, ((currentStepIndex) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Emergency Banner */}
      {hasEmergencyFlag && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-0 right-0 z-50 bg-red-500/20 border-b border-red-500/50 backdrop-blur-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <p className="text-sm text-red-400 font-medium">
                If this is a medical emergency, please call emergency services immediately (911 in the US).
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className={`fixed ${hasEmergencyFlag ? 'top-32' : 'top-20'} left-0 right-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-border/30`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {canGoBack && currentStep !== 'welcome' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack} 
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                HIPAA-Compliant Assessment
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-1.5 bg-background/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-2">
              {['Start', 'Info', 'Symptoms', 'Scan', 'Report'].map((label, i) => (
                <div 
                  key={label}
                  className={`flex flex-col items-center ${
                    i <= Math.floor(currentStepIndex / 3) 
                      ? 'text-primary' 
                      : 'text-muted-foreground/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    i <= Math.floor(currentStepIndex / 3) 
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/30'
                  }`} />
                  <span className="text-[10px] mt-1 hidden sm:block">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className={`fixed ${hasEmergencyFlag ? 'top-52' : 'top-40'} left-0 right-0 z-30`}>
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 backdrop-blur-sm border border-border/30 rounded-lg px-4 py-2">
            <p className="text-[11px] text-muted-foreground text-center">
              <span className="font-medium text-primary">ApneDoctors</span> provides complete support. 
              This assessment is for informational purposes and does not replace professional medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`flex-1 ${hasEmergencyFlag ? 'pt-64' : 'pt-52'} pb-12`}>
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
