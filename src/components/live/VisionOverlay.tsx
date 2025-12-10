import React from 'react';
import { cn } from '@/lib/utils';
import { VisionDetection } from '@/types/live';
import { AlertTriangle, Activity } from 'lucide-react';

interface VisionOverlayProps {
  detections: VisionDetection[];
  concernLevel: 'low' | 'medium' | 'high';
  isAnalyzing?: boolean;
  className?: string;
}

export const VisionOverlay: React.FC<VisionOverlayProps> = ({
  detections,
  concernLevel,
  isAnalyzing = false,
  className,
}) => {
  const getConcernColor = () => {
    switch (concernLevel) {
      case 'high':
        return 'text-destructive border-destructive';
      case 'medium':
        return 'text-warning border-warning';
      default:
        return 'text-primary border-primary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-destructive/80';
      case 'moderate':
        return 'bg-warning/80';
      default:
        return 'bg-primary/80';
    }
  };

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Scanning animation */}
      {isAnalyzing && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan"
            style={{
              animation: 'scan 2s linear infinite',
            }}
          />
        </div>
      )}

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50" />

      {/* Status indicator */}
      <div
        className={cn(
          'absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full',
          'bg-background/80 backdrop-blur-sm border text-xs font-medium',
          'flex items-center gap-2',
          getConcernColor()
        )}
      >
        {isAnalyzing ? (
          <>
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            {concernLevel === 'high' && <AlertTriangle className="w-3 h-3" />}
            <span>
              {concernLevel === 'high'
                ? 'High Concern'
                : concernLevel === 'medium'
                ? 'Moderate'
                : 'Normal'}
            </span>
          </>
        )}
      </div>

      {/* Detection badges */}
      {detections.length > 0 && (
        <div className="absolute bottom-16 left-4 right-4 flex flex-wrap gap-2">
          {detections.slice(0, 3).map((detection, i) => (
            <div
              key={i}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium text-white',
                getSeverityColor(detection.severity)
              )}
            >
              {detection.type}: {detection.location}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};
