import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { BODY_LOCATIONS } from '@/types/clinical-assessment';

interface BodyLocationStepProps {
  value?: string;
  onContinue: (location: string, specificLocation?: string) => void;
}

export function BodyLocationStep({ value, onContinue }: BodyLocationStepProps) {
  const [selectedLocation, setSelectedLocation] = useState(value || '');
  const [specificLocation, setSpecificLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = BODY_LOCATIONS.filter(loc =>
    loc.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedLocation) {
      onContinue(selectedLocation, selectedLocation === 'other' ? specificLocation : undefined);
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
          <MapPin className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-foreground mb-2"
        >
          Where is your discomfort?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Select the primary affected area
        </motion.p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search body areas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-background/50 border-border/50"
        />
      </motion.div>

      {/* Body Location Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6"
      >
        {filteredLocations.map((location, i) => (
          <motion.button
            key={location.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i }}
            onClick={() => setSelectedLocation(location.value)}
            className={`
              relative p-4 rounded-xl border-2 transition-all
              hover:border-primary/50 hover:bg-primary/5
              ${selectedLocation === location.value 
                ? 'border-primary bg-primary/10' 
                : 'border-border/50 bg-background/30'
              }
            `}
          >
            <div className="text-2xl mb-2">{location.icon}</div>
            <div className="text-sm font-medium text-foreground">{location.label}</div>
            {selectedLocation === location.value && (
              <motion.div
                layoutId="selection"
                className="absolute inset-0 border-2 border-primary rounded-xl"
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Specific Location Input (for "Other") */}
      {selectedLocation === 'other' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-foreground mb-2">
            Please specify the affected area
          </label>
          <Input
            type="text"
            placeholder="e.g., Left thumb, right rib cage..."
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
            className="bg-background/50 border-border/50"
          />
        </motion.div>
      )}

      {/* Reassurance Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/30 border border-border/50 rounded-xl p-4 mb-8"
      >
        <p className="text-sm text-muted-foreground text-center">
          <span className="text-primary font-medium">One step at a time:</span>{' '}
          Focus on the primary area of concern. You can describe additional areas later.
        </p>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={handleContinue}
          disabled={!selectedLocation || (selectedLocation === 'other' && !specificLocation)}
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
