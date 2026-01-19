import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, MessageSquare, Lightbulb, AlertTriangle } from 'lucide-react';
import { EMERGENCY_KEYWORDS } from '@/types/clinical-assessment';

interface SymptomsStepProps {
  value?: string;
  additionalInfo?: string;
  onContinue: (symptoms: string, additionalInfo?: string) => void;
}

const SYMPTOM_PROMPTS = [
  'What activities make the pain worse?',
  'What helps relieve the symptoms?',
  'Have you noticed any swelling or changes in appearance?',
  'Does the pain radiate to other areas?',
  'Have you had similar symptoms before?',
];

export function SymptomsStep({ value, additionalInfo: initialAdditionalInfo, onContinue }: SymptomsStepProps) {
  const [symptoms, setSymptoms] = useState(value || '');
  const [additionalInfo, setAdditionalInfo] = useState(initialAdditionalInfo || '');
  const [showAdditional, setShowAdditional] = useState(false);

  // Check for emergency keywords
  const detectedEmergencyKeywords = EMERGENCY_KEYWORDS.filter(keyword =>
    symptoms.toLowerCase().includes(keyword.toLowerCase()) ||
    additionalInfo.toLowerCase().includes(keyword.toLowerCase())
  );

  const hasEmergencyKeywords = detectedEmergencyKeywords.length > 0;
  const isValid = symptoms.trim().length >= 10;

  const handleContinue = () => {
    if (isValid) {
      onContinue(symptoms.trim(), additionalInfo.trim() || undefined);
    }
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
          <MessageSquare className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          Describe Your Symptoms
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Tell us what you're experiencing in your own words
        </motion.p>
      </div>

      {/* Emergency Alert */}
      {hasEmergencyKeywords && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-red-400 font-medium mb-1">
                Potential Emergency Detected
              </p>
              <p className="text-sm text-red-400/80">
                If you are experiencing a medical emergency, please call emergency services 
                immediately (911 in the US). This system cannot provide emergency medical care.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Symptom Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <label className="block text-sm font-semibold text-foreground mb-3">
          Primary Symptoms *
        </label>
        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms in detail. For example: 'I have sharp pain in my right knee when I walk up stairs. The pain started 3 days ago after I went jogging. I also notice some swelling on the side of my knee.'"
          className="min-h-[150px] bg-background/50 border-border/50 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${symptoms.length >= 10 ? 'text-primary' : 'text-muted-foreground'}`}>
            {symptoms.length} characters
          </span>
          <span className="text-xs text-muted-foreground">
            {symptoms.length < 10 ? 'Minimum 10 characters' : '✓ Valid'}
          </span>
        </div>
      </motion.div>

      {/* Guided Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold text-foreground">Helpful Prompts</span>
        </div>
        <div className="space-y-2">
          {SYMPTOM_PROMPTS.map((prompt, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="text-primary">•</span>
              {prompt}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional Information Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <button
          onClick={() => setShowAdditional(!showAdditional)}
          className="text-sm text-primary hover:underline"
        >
          {showAdditional ? '− Hide additional information' : '+ Add more details (optional)'}
        </button>
        
        {showAdditional && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <div className="holographic-card p-6 rounded-xl">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Additional Context (Optional)
              </label>
              <Textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any relevant medical history, medications, allergies, or recent activities that might be related..."
                className="min-h-[100px] bg-background/50 border-border/50 resize-none"
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Reassurance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <p className="text-sm text-muted-foreground text-center">
          <span className="text-primary font-medium">Your words matter:</span>{' '}
          Natural language is preferred. The AI will normalize and structure your 
          description for clinical relevance.
        </p>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={handleContinue}
          disabled={!isValid}
          variant="hero"
          size="lg"
          className="w-full"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
