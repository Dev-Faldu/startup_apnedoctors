import { Button } from '@/components/ui/button';
import { TriageResult, VisionAnalysisResult } from '@/types/assessment';
import { Activity, Eye, AlertTriangle, CheckCircle, ChevronRight, FileText } from 'lucide-react';

interface AnalysisViewProps {
  triageResult: TriageResult | null;
  visionResult: VisionAnalysisResult | null;
  onGenerateReport: () => void;
  isLoading: boolean;
}

export function AnalysisView({ triageResult, visionResult, onGenerateReport, isLoading }: AnalysisViewProps) {
  const getTriageLevelColor = (level: number) => {
    if (level <= 2) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (level <= 3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  const getTriageLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Emergency';
      case 2: return 'Urgent';
      case 3: return 'Semi-Urgent';
      case 4: return 'Standard';
      case 5: return 'Non-Urgent';
      default: return 'Unknown';
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'severe': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      case 'mild': return 'text-primary';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Step 3 of 4</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          AI Analysis Complete
        </h2>
        <p className="text-muted-foreground">
          Review your preliminary assessment results
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Triage Analysis Card */}
        {triageResult && (
          <div className="holographic-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Symptom Triage</h3>
                <p className="text-xs text-muted-foreground">AI-powered assessment</p>
              </div>
            </div>

            {/* Triage Level */}
            <div className={`p-4 rounded-lg border mb-4 ${getTriageLevelColor(triageResult.triageLevel)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Triage Level</span>
                <span className="text-lg font-bold">
                  {triageResult.triageLevel}/5 - {getTriageLevelLabel(triageResult.triageLevel)}
                </span>
              </div>
              <p className="text-sm mt-2 opacity-80">{triageResult.urgencyDescription}</p>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg mb-4">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-background/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${triageResult.confidenceScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">{triageResult.confidenceScore}%</span>
              </div>
            </div>

            {/* Possible Conditions */}
            {triageResult.possibleConditions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Possible Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {triageResult.possibleConditions.slice(0, 4).map((condition, i) => (
                    <span key={i} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {triageResult.redFlags.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Warning Signs</span>
                </div>
                <ul className="text-xs text-red-400/80 space-y-1">
                  {triageResult.redFlags.map((flag, i) => (
                    <li key={i}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Vision Analysis Card */}
        {visionResult && (
          <div className="holographic-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Visual Analysis</h3>
                <p className="text-xs text-muted-foreground">Computer vision assessment</p>
              </div>
            </div>

            {/* Inflammation Score */}
            <div className="p-4 bg-background/30 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Inflammation Score</span>
                <span className="text-lg font-bold text-primary">{visionResult.inflammationScore}/10</span>
              </div>
              <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${visionResult.inflammationScore * 10}%`,
                    background: `linear-gradient(90deg, hsl(var(--primary)), ${visionResult.inflammationScore > 6 ? '#ef4444' : 'hsl(var(--secondary))'})`
                  }}
                />
              </div>
            </div>

            {/* Detection Indicators */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-background/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {visionResult.rednessDetected ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-xs font-medium">Redness</span>
                </div>
                <span className={`text-sm font-semibold ${getSeverityColor(visionResult.rednessLevel)}`}>
                  {visionResult.rednessLevel.charAt(0).toUpperCase() + visionResult.rednessLevel.slice(1)}
                </span>
              </div>
              <div className="p-3 bg-background/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {visionResult.swellingDetected ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-xs font-medium">Swelling</span>
                </div>
                <span className={`text-sm font-semibold ${getSeverityColor(visionResult.swellingLevel)}`}>
                  {visionResult.swellingLevel.charAt(0).toUpperCase() + visionResult.swellingLevel.slice(1)}
                </span>
              </div>
            </div>

            {/* Observations */}
            {visionResult.observations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Observations</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {visionResult.observations.slice(0, 4).map((obs, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Action */}
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-xs text-primary">{visionResult.recommendedAction}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Actions */}
      {triageResult?.recommendedActions && triageResult.recommendedActions.length > 0 && (
        <div className="holographic-card p-6 rounded-xl mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Recommended Next Steps
          </h3>
          <div className="space-y-2">
            {triageResult.recommendedActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-background/30 rounded-lg">
                <span className="w-6 h-6 flex items-center justify-center bg-primary/20 text-primary text-sm font-bold rounded-full">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Report Button */}
      <Button
        onClick={onGenerateReport}
        disabled={isLoading}
        variant="hero"
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Generating Report...
          </>
        ) : (
          <>
            <FileText className="w-5 h-5 mr-2" />
            Generate Full Medical Report
            <ChevronRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        {triageResult?.disclaimer || 'This is an AI-assisted assessment and not a medical diagnosis. Please consult a qualified healthcare professional.'}
      </p>
    </div>
  );
}
