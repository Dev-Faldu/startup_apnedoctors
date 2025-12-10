import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceWaveformProps {
  isActive: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive,
  isSpeaking = false,
  className,
}) => {
  const bars = 12;

  return (
    <div className={cn('flex items-center justify-center gap-1 h-12', className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full transition-all duration-150',
            isActive ? 'bg-primary' : 'bg-muted',
            isSpeaking ? 'bg-accent' : ''
          )}
          style={{
            height: isActive ? `${Math.random() * 100}%` : '20%',
            animationDelay: `${i * 0.05}s`,
            animation: isActive ? 'pulse 0.5s ease-in-out infinite alternate' : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};
