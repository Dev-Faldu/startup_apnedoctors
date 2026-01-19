import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  ArrowRight,
  FileText,
  Lock,
  Database,
  Brain,
  AlertCircle
} from 'lucide-react';
import { ConsentRecord } from '@/types/clinical-assessment';

interface ConsentStepProps {
  onContinue: (consents: ConsentRecord[]) => void;
  onRecordConsent: (type: ConsentRecord['type'], given: boolean) => void;
}

export function ConsentStep({ onContinue, onRecordConsent }: ConsentStepProps) {
  const [consents, setConsents] = useState({
    terms: false,
    data_processing: false,
    ai_assessment: false,
  });

  const handleConsentChange = (key: keyof typeof consents, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
    onRecordConsent(key as ConsentRecord['type'], value);
  };

  const allRequired = consents.terms && consents.data_processing && consents.ai_assessment;

  const handleContinue = () => {
    const consentRecords: ConsentRecord[] = Object.entries(consents).map(([type, given]) => ({
      type: type as ConsentRecord['type'],
      given,
      timestamp: new Date().toISOString(),
    }));
    onContinue(consentRecords);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4"
        >
          <Shield className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          Consent & Privacy
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Please review and accept the following before proceeding
        </motion.p>
      </div>

      {/* Consent Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 mb-8"
      >
        {/* Terms of Use */}
        <div className={`holographic-card p-5 rounded-xl transition-all ${
          consents.terms ? 'border-primary/50' : ''
        }`}>
          <div className="flex items-start gap-4">
            <Checkbox
              id="terms"
              checked={consents.terms}
              onCheckedChange={(checked) => handleConsentChange('terms', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label 
                htmlFor="terms" 
                className="flex items-center gap-2 font-medium text-foreground cursor-pointer"
              >
                <FileText className="w-4 h-4 text-primary" />
                Terms of Use
                <span className="text-red-400 text-xs">*Required</span>
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                I understand that ApneDoctors provides information and decision-support only. 
                This is not a medical consultation and does not replace professional medical advice, 
                diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Data Processing */}
        <div className={`holographic-card p-5 rounded-xl transition-all ${
          consents.data_processing ? 'border-primary/50' : ''
        }`}>
          <div className="flex items-start gap-4">
            <Checkbox
              id="data_processing"
              checked={consents.data_processing}
              onCheckedChange={(checked) => handleConsentChange('data_processing', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label 
                htmlFor="data_processing" 
                className="flex items-center gap-2 font-medium text-foreground cursor-pointer"
              >
                <Database className="w-4 h-4 text-primary" />
                Data Processing
                <span className="text-red-400 text-xs">*Required</span>
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                I consent to the collection and processing of my health information for 
                the purpose of generating a structured assessment summary. My data will 
                be encrypted and stored securely.
              </p>
            </div>
          </div>
        </div>

        {/* AI Assessment */}
        <div className={`holographic-card p-5 rounded-xl transition-all ${
          consents.ai_assessment ? 'border-primary/50' : ''
        }`}>
          <div className="flex items-start gap-4">
            <Checkbox
              id="ai_assessment"
              checked={consents.ai_assessment}
              onCheckedChange={(checked) => handleConsentChange('ai_assessment', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label 
                htmlFor="ai_assessment" 
                className="flex items-center gap-2 font-medium text-foreground cursor-pointer"
              >
                <Brain className="w-4 h-4 text-primary" />
                AI-Assisted Analysis
                <span className="text-red-400 text-xs">*Required</span>
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                I understand that AI technology will be used to analyze my symptoms 
                and generate suggestions. AI outputs may contain uncertainties and should 
                be reviewed by a healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Your Privacy Matters:</span>{' '}
            All data is encrypted end-to-end. We do not share your information 
            with third parties. You can request data deletion at any time.
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-400/90">
            <span className="font-medium">Important Disclaimer:</span>{' '}
            ApneDoctors does not diagnose conditions, prescribe treatments, or provide 
            medical conclusions. For any medical emergency, contact emergency services immediately.
          </div>
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={handleContinue}
          disabled={!allRequired}
          variant="hero"
          size="lg"
          className="w-full"
        >
          I Understand & Agree
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
