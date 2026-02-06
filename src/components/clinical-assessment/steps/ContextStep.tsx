import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowRight, ClipboardList, Plus, X } from 'lucide-react';
import { ContextFactors } from '@/types/clinical-assessment';

interface ContextStepProps {
  value?: Partial<ContextFactors>;
  onContinue: (context: ContextFactors) => void;
}

export function ContextStep({ value, onContinue }: ContextStepProps) {
  const [context, setContext] = useState<ContextFactors>({
    hasRecentTrauma: value?.hasRecentTrauma ?? false,
    hasFever: value?.hasFever ?? false,
    hasSwelling: value?.hasSwelling ?? false,
    hasNumbness: value?.hasNumbness ?? false,
    hasLimitedMobility: value?.hasLimitedMobility ?? false,
    hasPreviousInjury: value?.hasPreviousInjury ?? false,
    previousInjuryDetails: value?.previousInjuryDetails ?? '',
    currentMedications: value?.currentMedications ?? [],
    allergies: value?.allergies ?? [],
    preExistingConditions: value?.preExistingConditions ?? [],
    recentActivities: value?.recentActivities ?? '',
  });

  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [showMedications, setShowMedications] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);

  const updateContext = (key: keyof ContextFactors, value: ContextFactors[keyof ContextFactors]) => {
    setContext(prev => ({ ...prev, [key]: value }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      updateContext('currentMedications', [...(context.currentMedications || []), newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    updateContext('currentMedications', (context.currentMedications || []).filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      updateContext('allergies', [...(context.allergies || []), newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    updateContext('allergies', (context.allergies || []).filter((_, i) => i !== index));
  };

  const contextQuestions = [
    { key: 'hasRecentTrauma', label: 'Recent trauma or injury', description: 'Any accidents, falls, or impacts' },
    { key: 'hasFever', label: 'Fever or chills', description: 'Elevated temperature or feeling cold' },
    { key: 'hasSwelling', label: 'Visible swelling', description: 'Noticeable swelling in the affected area' },
    { key: 'hasNumbness', label: 'Numbness or tingling', description: 'Loss of sensation or pins-and-needles feeling' },
    { key: 'hasLimitedMobility', label: 'Limited range of motion', description: 'Difficulty moving the affected area' },
    { key: 'hasPreviousInjury', label: 'Previous injury to this area', description: 'History of injury in the same location' },
  ] as const;

  const handleContinue = () => {
    onContinue(context);
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
          <ClipboardList className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          Additional Context
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          This information helps provide more accurate insights
        </motion.p>
      </div>

      {/* Context Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <label className="block text-sm font-semibold text-foreground mb-4">
          Associated Factors
        </label>
        <div className="space-y-4">
          {contextQuestions.map((question, i) => (
            <motion.div
              key={question.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                context[question.key] ? 'bg-primary/10 border border-primary/30' : 'bg-background/30'
              }`}
            >
              <Checkbox
                id={question.key}
                checked={context[question.key] as boolean}
                onCheckedChange={(checked) => updateContext(question.key, checked as boolean)}
                className="mt-1"
              />
              <label htmlFor={question.key} className="flex-1 cursor-pointer">
                <div className="font-medium text-foreground">{question.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{question.description}</div>
              </label>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Previous Injury Details */}
      {context.hasPreviousInjury && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="holographic-card p-6 rounded-xl mb-6"
        >
          <label className="block text-sm font-semibold text-foreground mb-3">
            Previous Injury Details
          </label>
          <Textarea
            value={context.previousInjuryDetails}
            onChange={(e) => updateContext('previousInjuryDetails', e.target.value)}
            placeholder="Describe the previous injury, when it occurred, and how it was treated..."
            className="min-h-[80px] bg-background/50 border-border/50 resize-none"
          />
        </motion.div>
      )}

      {/* Medications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <button
          onClick={() => setShowMedications(!showMedications)}
          className="w-full flex items-center justify-between"
        >
          <span className="text-sm font-semibold text-foreground">
            Current Medications (Optional)
          </span>
          <Plus className={`w-4 h-4 text-primary transition-transform ${showMedications ? 'rotate-45' : ''}`} />
        </button>
        
        {showMedications && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <div className="flex gap-2 mb-3">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Add medication..."
                className="bg-background/50 border-border/50"
                onKeyDown={(e) => e.key === 'Enter' && addMedication()}
              />
              <Button onClick={addMedication} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {context.currentMedications?.map((med, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full"
                >
                  {med}
                  <button onClick={() => removeMedication(i)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Allergies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="holographic-card p-6 rounded-xl mb-6"
      >
        <button
          onClick={() => setShowAllergies(!showAllergies)}
          className="w-full flex items-center justify-between"
        >
          <span className="text-sm font-semibold text-foreground">
            Known Allergies (Optional)
          </span>
          <Plus className={`w-4 h-4 text-primary transition-transform ${showAllergies ? 'rotate-45' : ''}`} />
        </button>
        
        {showAllergies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <div className="flex gap-2 mb-3">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy..."
                className="bg-background/50 border-border/50"
                onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
              />
              <Button onClick={addAllergy} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {context.allergies?.map((allergy, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full"
                >
                  {allergy}
                  <button onClick={() => removeAllergy(i)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="holographic-card p-6 rounded-xl mb-8"
      >
        <label className="block text-sm font-semibold text-foreground mb-3">
          Recent Activities (Optional)
        </label>
        <Textarea
          value={context.recentActivities}
          onChange={(e) => updateContext('recentActivities', e.target.value)}
          placeholder="Any recent physical activities, sports, or changes in routine that might be relevant..."
          className="min-h-[80px] bg-background/50 border-border/50 resize-none"
        />
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={handleContinue}
          variant="hero"
          size="lg"
          className="w-full"
        >
          Continue to Review
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
