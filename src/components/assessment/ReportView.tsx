import { Button } from '@/components/ui/button';
import { MedicalReport } from '@/types/assessment';
import { FileText, Download, RefreshCcw, AlertTriangle, CheckCircle, Activity, Stethoscope, Calendar, Shield } from 'lucide-react';

interface ReportViewProps {
  report: MedicalReport;
  onReset: () => void;
}

export function ReportView({ report, onReset }: ReportViewProps) {
  const handleDownload = () => {
    const reportText = JSON.stringify(report, null, 2);
    const blob = new Blob([reportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${report.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTriageLevelColor = (level: number) => {
    if (level <= 2) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (level <= 3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">Assessment Complete</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Medical Assessment Report
        </h2>
        <p className="text-muted-foreground">
          Report ID: {report.reportId}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Generated: {new Date(report.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Patient Summary */}
        {report.patientSummary && (
          <div className="holographic-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Patient Summary</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Chief Complaint</span>
                <p className="text-sm font-medium text-foreground mt-1">{report.patientSummary.chiefComplaint}</p>
              </div>
              <div className="p-3 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Affected Area</span>
                <p className="text-sm font-medium text-foreground mt-1">{report.patientSummary.affectedArea}</p>
              </div>
              <div className="p-3 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Duration</span>
                <p className="text-sm font-medium text-foreground mt-1">{report.patientSummary.duration}</p>
              </div>
              <div className="p-3 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Pain Level</span>
                <p className="text-sm font-medium text-foreground mt-1">{report.patientSummary.painLevel}/10</p>
              </div>
            </div>
          </div>
        )}

        {/* Triage Assessment */}
        {report.triageAssessment && (
          <div className="holographic-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">Triage Assessment</h3>
            </div>
            
            <div className={`p-4 rounded-lg border mb-4 ${getTriageLevelColor(report.triageAssessment.level)}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Urgency Level</span>
                <span className="text-lg font-bold">{report.triageAssessment.level}/5</span>
              </div>
              <p className="text-sm mt-2 opacity-80">{report.triageAssessment.urgency}</p>
            </div>

            {report.triageAssessment.possibleConditions?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Possible Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {report.triageAssessment.possibleConditions.map((condition, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {report.triageAssessment.differentialDiagnosis?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Differential Diagnosis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {report.triageAssessment.differentialDiagnosis.map((diagnosis, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-secondary">•</span>
                      {diagnosis}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Clinical Findings */}
        {report.clinicalFindings && (
          <div className="holographic-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Clinical Findings</h3>
            </div>
            
            {report.clinicalFindings.visualAssessment && (
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-background/30 rounded-lg text-center">
                  <span className="text-xs text-muted-foreground">Inflammation</span>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {report.clinicalFindings.visualAssessment.inflammationScore}/10
                  </p>
                </div>
                <div className="p-3 bg-background/30 rounded-lg text-center">
                  <span className="text-xs text-muted-foreground">Redness</span>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {report.clinicalFindings.visualAssessment.redness}
                  </p>
                </div>
                <div className="p-3 bg-background/30 rounded-lg text-center">
                  <span className="text-xs text-muted-foreground">Swelling</span>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {report.clinicalFindings.visualAssessment.swelling}
                  </p>
                </div>
              </div>
            )}

            {report.clinicalFindings.symptomAnalysis?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Symptom Analysis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {report.clinicalFindings.symptomAnalysis.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Red Flags */}
        {report.redFlags?.length > 0 && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="font-semibold text-red-400">Warning Signs Detected</h3>
            </div>
            <ul className="space-y-2">
              {report.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-400/80">
                  <span>⚠️</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && (
          <div className="holographic-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground">Recommendations</h3>
            </div>

            {report.recommendations.immediateActions?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Immediate Actions</h4>
                <div className="space-y-2">
                  {report.recommendations.immediateActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                      <span className="w-6 h-6 flex items-center justify-center bg-primary text-background text-sm font-bold rounded-full">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.recommendations.treatmentSuggestions?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Treatment Suggestions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {report.recommendations.treatmentSuggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-secondary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.recommendations.followUpPlan && (
              <div className="p-3 bg-background/30 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Follow-up Plan</span>
                </div>
                <p className="text-sm text-muted-foreground">{report.recommendations.followUpPlan}</p>
              </div>
            )}

            {report.recommendations.specialistReferral && (
              <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
                <p className="text-sm text-secondary">
                  <strong>Specialist Referral Recommended:</strong> {report.recommendations.specialistType}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Confidence Metrics */}
        {report.confidenceMetrics && (
          <div className="holographic-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">AI Confidence Metrics</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-3 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Overall</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${report.confidenceMetrics.overallConfidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-primary">{report.confidenceMetrics.overallConfidence}%</span>
                </div>
              </div>
              <div className="p-3 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Visual Analysis</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${report.confidenceMetrics.visualAnalysisConfidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-secondary">{report.confidenceMetrics.visualAnalysisConfidence}%</span>
                </div>
              </div>
              <div className="p-3 bg-background/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Symptom Analysis</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${report.confidenceMetrics.symptomAnalysisConfidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-accent">{report.confidenceMetrics.symptomAnalysisConfidence}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 bg-muted/30 border border-border/50 rounded-xl">
          <p className="text-xs text-muted-foreground text-center">
            {report.disclaimer || 'This AI-generated report is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for proper diagnosis and treatment.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
        <Button onClick={onReset} variant="hero" className="flex-1">
          <RefreshCcw className="w-4 h-4 mr-2" />
          New Assessment
        </Button>
      </div>
    </div>
  );
}
