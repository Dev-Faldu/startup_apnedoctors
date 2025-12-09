import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientInfo } from '@/types/assessment';
import { Activity, MapPin, Clock, MessageSquare, ChevronRight, AlertCircle } from 'lucide-react';

interface SymptomFormProps {
  onSubmit: (info: PatientInfo) => void;
  isLoading: boolean;
}

const BODY_LOCATIONS = [
  'Knee', 'Shoulder', 'Hip', 'Ankle', 'Wrist', 'Elbow', 
  'Lower Back', 'Upper Back', 'Neck', 'Hand', 'Foot', 'Other'
];

const DURATION_OPTIONS = [
  'Less than 24 hours',
  '1-3 days',
  '3-7 days',
  '1-2 weeks',
  '2-4 weeks',
  'More than 1 month',
  'More than 3 months'
];

export function SymptomForm({ onSubmit, isLoading }: SymptomFormProps) {
  const [symptoms, setSymptoms] = useState('');
  const [painLevel, setPainLevel] = useState([5]);
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim() || !location || !duration) {
      return;
    }

    onSubmit({
      symptoms: symptoms.trim(),
      painLevel: painLevel[0],
      duration,
      location,
      additionalInfo: additionalInfo.trim()
    });
  };

  const isValid = symptoms.trim() && location && duration;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Step 1 of 4</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Describe Your Symptoms
        </h2>
        <p className="text-muted-foreground">
          Help us understand your condition for accurate assessment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Body Location */}
        <div className="holographic-card p-6 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Affected Area
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Select the affected body part" />
            </SelectTrigger>
            <SelectContent>
              {BODY_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pain Level */}
        <div className="holographic-card p-6 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <AlertCircle className="w-4 h-4 text-primary" />
            Pain Level: <span className="text-primary">{painLevel[0]}/10</span>
          </label>
          <div className="px-2">
            <Slider
              value={painLevel}
              onValueChange={setPainLevel}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="holographic-card p-6 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Clock className="w-4 h-4 text-primary" />
            Duration
          </label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="How long have you had these symptoms?" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Symptoms Description */}
        <div className="holographic-card p-6 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            Describe Your Symptoms
          </label>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe what you're experiencing... (e.g., 'Sharp pain when walking, stiffness in the morning, swelling around the joint')"
            className="min-h-[120px] bg-background/50 border-border/50 resize-none"
            required
          />
        </div>

        {/* Additional Info */}
        <div className="holographic-card p-6 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <MessageSquare className="w-4 h-4 text-secondary" />
            Additional Information (Optional)
          </label>
          <Textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Any relevant medical history, recent injuries, or medications..."
            className="min-h-[80px] bg-background/50 border-border/50 resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full"
          variant="hero"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analyzing Symptoms...
            </>
          ) : (
            <>
              Continue to Visual Scan
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
