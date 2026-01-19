import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { DURATION_OPTIONS } from '@/types/clinical-assessment';

interface DurationStepProps {
  value?: string;
  onsetType?: string;
  onContinue: (duration: string, onsetType: 'sudden' | 'gradual' | 'unknown') => void;
}

const ONSET_TYPES = [
  { value: 'sudden', label: 'Sudden', description: 'Started abruptly', icon: '⚡' },
  { value: 'gradual', label: 'Gradual', description: 'Developed slowly', icon: '📈' },
  { value: 'unknown', label: 'Unsure', description: 'Not certain when it started', icon: '❓' },
] as const;

export function DurationStep({ value, onsetType: initialOnsetType, onContinue }: DurationStepProps) {
  const [duration, setDuration] = useState(value || '');
  const [onsetType, setOnsetType] = useState<'sudden' | 'gradual' | 'unknown' | ''>(
    initialOnsetType as 'sudden' | 'gradual' | 'unknown' || ''
  );

  const selectedDuration = DURATION_OPTIONS.find(d => d.value === duration);
  const isValid = duration && onsetType;

  const handleContinue = () => {
    if (isValid) {
      onContinue(duration, onsetType);
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
          <Clock className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          How long have you experienced this?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Duration helps determine the nature of your condition
        </motion.p>
      </div>

      {/* Duration Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <label className="block text-sm font-semibold text-foreground mb-4">
          Duration of symptoms
        </label>
        <div className="space-y-3">
          {DURATION_OPTIONS.map((option, i) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => setDuration(option.value)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                hover:border-primary/50 hover:bg-primary/5
                ${duration === option.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border/50 bg-background/30'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  option.severity === 'acute' 
                    ? 'bg-yellow-500/20' 
                    : option.severity === 'subacute'
                    ? 'bg-orange-500/20'
                    : 'bg-red-500/20'
                }`}>
                  <Clock className={`w-5 h-5 ${
                    option.severity === 'acute' 
                      ? 'text-yellow-400' 
                      : option.severity === 'subacute'
                      ? 'text-orange-400'
                      : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {option.severity} condition
                  </div>
                </div>
              </div>
              {duration === option.value && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Onset Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <label className="block text-sm font-semibold text-foreground mb-4">
          How did the symptoms start?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {ONSET_TYPES.map((onset) => (
            <button
              key={onset.value}
              onClick={() => setOnsetType(onset.value)}
              className={`
                p-4 rounded-xl border-2 text-center transition-all
                hover:border-primary/50 hover:bg-primary/5
                ${onsetType === onset.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border/50 bg-background/30'
                }
              `}
            >
              <div className="text-2xl mb-2">{onset.icon}</div>
              <div className="font-medium text-foreground text-sm">{onset.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{onset.description}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Clinical Insight */}
      {selectedDuration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-xl p-4 mb-8 ${
            selectedDuration.severity === 'acute' 
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : selectedDuration.severity === 'subacute'
              ? 'bg-orange-500/10 border-orange-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
              selectedDuration.severity === 'acute' 
                ? 'text-yellow-400'
                : selectedDuration.severity === 'subacute'
                ? 'text-orange-400'
                : 'text-red-400'
            }`} />
            <p className={`text-sm ${
              selectedDuration.severity === 'acute' 
                ? 'text-yellow-400/90'
                : selectedDuration.severity === 'subacute'
                ? 'text-orange-400/90'
                : 'text-red-400/90'
            }`}>
              {selectedDuration.severity === 'acute' && (
                <>
                  <span className="font-medium">Acute symptoms</span> are recent and may 
                  indicate a new condition or injury requiring prompt attention.
                </>
              )}
              {selectedDuration.severity === 'subacute' && (
                <>
                  <span className="font-medium">Subacute symptoms</span> suggest an evolving 
                  condition. Medical evaluation is recommended if symptoms persist.
                </>
              )}
              {selectedDuration.severity === 'chronic' && (
                <>
                  <span className="font-medium">Chronic symptoms</span> indicate a persistent 
                  condition. Consider comprehensive evaluation and management strategies.
                </>
              )}
            </p>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
