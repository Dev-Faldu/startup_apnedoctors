import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Camera, 
  Eye, 
  AlertTriangle, 
  Lock,
  CheckCircle,
  X
} from 'lucide-react';

interface VisualConsentStepProps {
  onAccept: () => void;
  onSkip: () => void;
  triageLevel?: number;
}

export function VisualConsentStep({ onAccept, onSkip, triageLevel }: VisualConsentStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4"
        >
          <Eye className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          Visual Assessment (Optional)
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Capture an image of the affected area for AI visual analysis
        </motion.p>
      </div>

      {/* Preliminary Triage Result */}
      {triageLevel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`holographic-card p-4 rounded-xl mb-6 border ${
            triageLevel <= 2 ? 'border-red-500/50' :
            triageLevel <= 3 ? 'border-yellow-500/50' :
            'border-green-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Preliminary Assessment</span>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              triageLevel <= 2 ? 'bg-red-500/20 text-red-400' :
              triageLevel <= 3 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              Level {triageLevel}/5
            </div>
          </div>
          {triageLevel <= 2 && (
            <p className="text-sm text-red-400/80 mt-2">
              ⚠️ Your symptoms suggest potential urgency. Consider seeking medical care soon.
            </p>
          )}
        </motion.div>
      )}

      {/* Visual Analysis Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">What Visual Analysis Can Detect</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: 'Visible swelling', icon: '🔍' },
            { label: 'Redness or inflammation', icon: '🔴' },
            { label: 'Bruising or discoloration', icon: '💜' },
            { label: 'Asymmetry', icon: '📐' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Limitations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-400/90">
            <span className="font-medium">Important Limitations:</span>
            <ul className="mt-2 space-y-1">
              <li>• Visual analysis cannot detect internal conditions</li>
              <li>• AI analysis supplements but does not replace clinical examination</li>
              <li>• Image quality affects analysis accuracy</li>
              <li>• Results are indicative, not diagnostic</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Privacy Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Privacy Assurance:</span>{' '}
            Images are processed in real-time and are not permanently stored. 
            Only anonymized metadata and AI-extracted features are retained for your records.
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
      >
        <Button
          onClick={onAccept}
          variant="hero"
          size="lg"
          className="w-full"
        >
          <Camera className="w-5 h-5 mr-2" />
          Continue to Visual Scan
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <Button
          onClick={onSkip}
          variant="ghost"
          size="lg"
          className="w-full text-muted-foreground"
        >
          <X className="w-4 h-4 mr-2" />
          Skip Visual Analysis
        </Button>
      </motion.div>
    </div>
  );
}
