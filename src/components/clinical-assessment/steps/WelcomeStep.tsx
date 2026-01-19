import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Stethoscope, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Lock,
  Activity,
  Eye
} from 'lucide-react';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* Hero Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
      >
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">AI-Powered Medical Assessment</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
      >
        Start Your Medical Assessment
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
      >
        A comprehensive, clinician-designed intake process that prepares 
        structured information for your healthcare journey.
      </motion.p>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid sm:grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            icon: Clock,
            title: '5-10 Minutes',
            description: 'Quick, guided process',
          },
          {
            icon: Eye,
            title: 'Visual Analysis',
            description: 'Optional AI-powered scan',
          },
          {
            icon: Shield,
            title: 'Secure & Private',
            description: 'HIPAA-compliant data',
          },
        ].map((feature, i) => (
          <div 
            key={feature.title}
            className="holographic-card p-4 rounded-xl text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-3">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </motion.div>

      {/* What to Expect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="holographic-card p-6 rounded-xl mb-8 text-left"
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          What to Expect
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Describe your symptoms in your own words',
            'Rate your pain level and characteristics',
            'Provide relevant medical history',
            'Optional: Visual scan of affected area',
            'Receive AI-structured summary',
            'Get actionable next steps',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Important:</span>{' '}
              This system provides decision-support and information-structuring. 
              It does not provide diagnoses, prescriptions, or medical conclusions. 
              Always consult a qualified healthcare professional.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={onContinue}
          variant="hero"
          size="lg"
          className="text-lg px-8"
        >
          Begin Assessment
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          No registration required • Free evaluation
        </p>
      </motion.div>
    </div>
  );
}
