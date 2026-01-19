import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Activity, Info } from 'lucide-react';
import { PAIN_PATTERNS, PAIN_QUALITIES } from '@/types/clinical-assessment';

interface PainAssessmentStepProps {
  painLevel?: number;
  painPattern?: string;
  painQuality?: string;
  onContinue: (painLevel: number, painPattern: string, painQuality: string) => void;
}

const PAIN_LABELS: Record<number, { label: string; color: string; description: string }> = {
  0: { label: 'No Pain', color: 'text-green-400', description: 'No discomfort' },
  1: { label: 'Minimal', color: 'text-green-400', description: 'Barely noticeable' },
  2: { label: 'Mild', color: 'text-green-300', description: 'Minor discomfort' },
  3: { label: 'Moderate', color: 'text-yellow-400', description: 'Noticeable but manageable' },
  4: { label: 'Moderate', color: 'text-yellow-400', description: 'Distracting' },
  5: { label: 'Moderate', color: 'text-yellow-500', description: 'Limits some activities' },
  6: { label: 'Severe', color: 'text-orange-400', description: 'Hard to concentrate' },
  7: { label: 'Severe', color: 'text-orange-500', description: 'Interferes with basic needs' },
  8: { label: 'Very Severe', color: 'text-red-400', description: 'Difficult to function' },
  9: { label: 'Very Severe', color: 'text-red-500', description: 'Unable to do most activities' },
  10: { label: 'Worst Possible', color: 'text-red-600', description: 'Emergency level pain' },
};

export function PainAssessmentStep({ 
  painLevel: initialPainLevel = 5, 
  painPattern: initialPainPattern,
  painQuality: initialPainQuality,
  onContinue 
}: PainAssessmentStepProps) {
  const [painLevel, setPainLevel] = useState([initialPainLevel]);
  const [painPattern, setPainPattern] = useState(initialPainPattern || '');
  const [painQuality, setPainQuality] = useState(initialPainQuality || '');

  const currentPainInfo = PAIN_LABELS[painLevel[0]];
  const isValid = painPattern && painQuality;

  const handleContinue = () => {
    if (isValid) {
      onContinue(painLevel[0], painPattern, painQuality);
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
          <Activity className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          Pain Assessment
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Help us understand your pain characteristics
        </motion.p>
      </div>

      {/* Pain Level Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Pain Intensity
          </label>
          <div className={`text-2xl font-bold ${currentPainInfo.color}`}>
            {painLevel[0]}/10
          </div>
        </div>
        
        <div className="px-2 mb-4">
          <Slider
            value={painLevel}
            onValueChange={setPainLevel}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-center gap-3 p-3 bg-background/30 rounded-lg">
          <span className={`text-lg font-semibold ${currentPainInfo.color}`}>
            {currentPainInfo.label}
          </span>
          <span className="text-muted-foreground">—</span>
          <span className="text-sm text-muted-foreground">
            {currentPainInfo.description}
          </span>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-4 px-1">
          <span>No Pain</span>
          <span>Moderate</span>
          <span>Worst Pain</span>
        </div>
      </motion.div>

      {/* Pain Pattern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <label className="block text-sm font-semibold text-foreground mb-4">
          When does the pain occur?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAIN_PATTERNS.map((pattern) => (
            <button
              key={pattern.value}
              onClick={() => setPainPattern(pattern.value)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all
                hover:border-primary/50 hover:bg-primary/5
                ${painPattern === pattern.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border/50 bg-background/30'
                }
              `}
            >
              <div className="font-medium text-foreground">{pattern.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{pattern.description}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pain Quality */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <label className="block text-sm font-semibold text-foreground mb-4">
          How would you describe the pain?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PAIN_QUALITIES.map((quality) => (
            <button
              key={quality.value}
              onClick={() => setPainQuality(quality.value)}
              className={`
                p-3 rounded-xl border-2 text-center transition-all
                hover:border-primary/50 hover:bg-primary/5
                ${painQuality === quality.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border/50 bg-background/30'
                }
              `}
            >
              <div className="font-medium text-foreground text-sm">{quality.label}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Clinical Note:</span>{' '}
            Pain assessment is subjective. Your honest response helps us understand 
            your experience better. There are no "wrong" answers.
          </p>
        </div>
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
