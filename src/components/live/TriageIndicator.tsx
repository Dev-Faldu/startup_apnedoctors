import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, AlertOctagon } from 'lucide-react';

interface TriageIndicatorProps {
  level: 'GREEN' | 'AMBER' | 'RED' | null;
  className?: string;
}

export const TriageIndicator: React.FC<TriageIndicatorProps> = ({
  level,
  className,
}) => {
  const getConfig = () => {
    switch (level) {
      case 'RED':
        return {
          bg: 'bg-destructive',
          text: 'text-destructive-foreground',
          icon: AlertOctagon,
          label: 'EMERGENCY',
          description: 'Seek immediate care',
        };
      case 'AMBER':
        return {
          bg: 'bg-warning',
          text: 'text-warning-foreground',
          icon: AlertTriangle,
          label: 'DOCTOR VISIT',
          description: 'Schedule within 24-48h',
        };
      case 'GREEN':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: Shield,
          label: 'SELF-CARE',
          description: 'Monitor at home',
        };
      default:
        return {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          icon: Shield,
          label: 'ASSESSING',
          description: 'Gathering information...',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl',
        config.bg,
        className
      )}
    >
      <Icon className={cn('w-6 h-6', config.text)} />
      <div>
        <div className={cn('font-bold text-sm', config.text)}>
          {config.label}
        </div>
        <div className={cn('text-xs opacity-90', config.text)}>
          {config.description}
        </div>
      </div>
    </div>
  );
};
