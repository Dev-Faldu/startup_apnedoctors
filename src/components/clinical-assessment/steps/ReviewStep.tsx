import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Edit2, 
  MapPin, 
  Activity, 
  Clock, 
  MessageSquare, 
  ClipboardList,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ClinicalIntakeData, BODY_LOCATIONS, DURATION_OPTIONS, PAIN_PATTERNS, PAIN_QUALITIES } from '@/types/clinical-assessment';

interface ReviewStepProps {
  intakeData: Partial<ClinicalIntakeData>;
  onEdit: (step: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function ReviewStep({ intakeData, onEdit, onSubmit, isLoading }: ReviewStepProps) {
  const bodyLocation = BODY_LOCATIONS.find(l => l.value === intakeData.bodyLocation);
  const duration = DURATION_OPTIONS.find(d => d.value === intakeData.duration);
  const painPattern = PAIN_PATTERNS.find(p => p.value === intakeData.painPattern);
  const painQuality = PAIN_QUALITIES.find(q => q.value === intakeData.painQuality);

  const contextItems = [
    { key: 'hasRecentTrauma', label: 'Recent trauma' },
    { key: 'hasFever', label: 'Fever' },
    { key: 'hasSwelling', label: 'Swelling' },
    { key: 'hasNumbness', label: 'Numbness' },
    { key: 'hasLimitedMobility', label: 'Limited mobility' },
    { key: 'hasPreviousInjury', label: 'Previous injury' },
  ].filter(item => intakeData.contextFactors?.[item.key as keyof typeof intakeData.contextFactors]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4"
        >
          <ClipboardList className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          Review Your Information
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Confirm the details before AI analysis
        </motion.p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4 mb-8">
        {/* Body Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="holographic-card p-4 rounded-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Affected Area</div>
                <div className="font-semibold text-foreground">
                  {bodyLocation?.icon} {bodyLocation?.label || intakeData.bodyLocation}
                  {intakeData.bodyLocationSpecific && ` - ${intakeData.bodyLocationSpecific}`}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit('body-location')}
              className="text-primary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Pain Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="holographic-card p-4 rounded-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pain Assessment</div>
                <div className="font-semibold text-foreground">
                  Level {intakeData.painLevel}/10 • {painPattern?.label} • {painQuality?.label}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit('pain-assessment')}
              className="text-primary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Duration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="holographic-card p-4 rounded-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="font-semibold text-foreground">
                  {duration?.label} • {intakeData.onsetType === 'sudden' ? 'Sudden onset' : 
                    intakeData.onsetType === 'gradual' ? 'Gradual onset' : 'Unknown onset'}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit('duration')}
              className="text-primary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Symptoms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="holographic-card p-4 rounded-xl"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Symptoms Description</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit('symptoms')}
              className="text-primary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-foreground bg-background/30 p-3 rounded-lg">
            "{intakeData.symptoms}"
          </p>
        </motion.div>

        {/* Context Factors */}
        {contextItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="holographic-card p-4 rounded-xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Associated Factors</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit('context')}
                className="text-primary"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {contextItems.map((item) => (
                <span 
                  key={item.key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/20 text-secondary text-sm rounded-full"
                >
                  <CheckCircle className="w-3 h-3" />
                  {item.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Analysis Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">What happens next:</span>{' '}
            Your information will be analyzed by our AI system. This will generate 
            structured insights, but does <strong>not</strong> constitute a medical diagnosis. 
            The results should be reviewed with a healthcare professional.
          </div>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          variant="hero"
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analyzing Your Information...
            </>
          ) : (
            <>
              Submit for AI Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
