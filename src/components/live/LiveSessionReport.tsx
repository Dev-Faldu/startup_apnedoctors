import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  FileText,
  Download,
  Printer,
  Share2,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Brain,
  Eye,
  Stethoscope,
  Shield,
  Sparkles,
  TrendingUp,
  Calendar,
  User,
  Mic,
  Camera as CameraIcon,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Pill,
  Phone,
} from 'lucide-react';
import { LiveSession, LiveTriageResult, LiveVisionResult } from '@/types/live';

interface LiveSessionReportProps {
  session: LiveSession;
  triage: LiveTriageResult | null;
  visionResults: LiveVisionResult[];
  onClose: () => void;
}

interface FullReport {
  reportId: string;
  generatedAt: string;
  sessionDuration: string;
  patientSummary: {
    chiefComplaint: string;
    presentingSymptoms: string[];
    affectedArea: string;
    duration: string;
    painLevel: number;
    conversationSummary: string;
  };
  clinicalFindings: {
    visualAssessment: {
      findings: string[];
      abnormalities: string[];
      severity: 'mild' | 'moderate' | 'severe';
      inflammationScore: number;
      redness: string;
      swelling: string;
    };
    symptomAnalysis: string[];
    vitalSignsEstimate: {
      concernLevel: string;
      recommendation: string;
    };
  };
  triageAssessment: {
    level: number;
    category: string;
    color: string;
    urgency: string;
    rationale: string;
    possibleConditions: string[];
    differentialDiagnosis: string[];
  };
  redFlags: Array<{
    flag: string;
    significance: string;
    action: string;
  }>;
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    selfCare: string[];
    whenToSeekCare: string[];
    followUp: string;
    specialistReferral: boolean;
    specialistType?: string;
  };
  aiAnalysis: {
    voiceAnalysisInsights: string[];
    visualAnalysisInsights: string[];
    multimodalCorrelation: string;
  };
  confidenceMetrics: {
    overall: number;
    voiceAnalysis: number;
    visualAnalysis: number;
    triageAccuracy: number;
  };
  disclaimer: string;
}

export function LiveSessionReport({ session, triage, visionResults, onClose }: LiveSessionReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<FullReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    clinical: true,
    triage: true,
    recommendations: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Calculate session duration
      const duration = session.endTime 
        ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
        : Math.round((Date.now() - session.startTime.getTime()) / 1000 / 60);

      // Prepare conversation context
      const conversation = session.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));

      // Aggregate vision results
      const visionSummary = visionResults.length > 0 ? {
        totalAnalyses: visionResults.length,
        detections: visionResults.flatMap(v => v.detections || []),
        concernLevels: visionResults.map(v => v.concernLevel),
        overallAssessments: visionResults.map(v => v.overallAssessment).filter(Boolean),
        recommendations: [...new Set(visionResults.flatMap(v => v.recommendations || []))],
      } : null;

      const { data, error: fnError } = await supabase.functions.invoke('ai-live-session-report', {
        body: {
          sessionId: session.id,
          sessionDuration: `${duration} minutes`,
          conversation,
          triageData: triage,
          visionData: visionSummary,
        },
      });

      if (fnError) throw fnError;
      setReport(data);
    } catch (err: any) {
      console.error('Report generation error:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    
    const reportContent = generatePrintableReport(report);
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-consultation-report-${report.reportId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!report) return;
    const printContent = generatePrintableReport(report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintableReport = (report: FullReport): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Medical Consultation Report - ${report.reportId}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a2e; }
    .header { text-align: center; border-bottom: 3px solid #00d4ff; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #0a0a1a; }
    .logo span { color: #00d4ff; }
    .report-id { color: #666; font-size: 12px; margin-top: 10px; }
    h2 { color: #0a0a1a; border-left: 4px solid #00d4ff; padding-left: 15px; margin-top: 30px; }
    .section { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 15px 0; }
    .triage-badge { display: inline-block; padding: 10px 25px; border-radius: 25px; font-weight: bold; font-size: 18px; }
    .triage-red { background: #fee2e2; color: #dc2626; }
    .triage-amber { background: #fef3c7; color: #d97706; }
    .triage-green { background: #d1fae5; color: #059669; }
    .metric { display: inline-block; text-align: center; padding: 15px 25px; background: #fff; border-radius: 10px; margin: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .metric-value { font-size: 28px; font-weight: bold; color: #00d4ff; }
    .metric-label { font-size: 12px; color: #666; }
    .red-flag { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 10px 0; border-radius: 0 10px 10px 0; }
    .recommendation { background: #d1fae5; padding: 12px 20px; border-radius: 8px; margin: 8px 0; }
    .disclaimer { background: #f3f4f6; padding: 20px; border-radius: 10px; margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    @media print { body { padding: 20px; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Apne<span>Doctors</span></div>
    <h1>AI Medical Consultation Report</h1>
    <div class="report-id">Report ID: ${report.reportId}<br/>Generated: ${new Date(report.generatedAt).toLocaleString()}</div>
  </div>

  <h2>Patient Summary</h2>
  <div class="section">
    <p><strong>Chief Complaint:</strong> ${report.patientSummary.chiefComplaint}</p>
    <p><strong>Session Duration:</strong> ${report.sessionDuration}</p>
    <p><strong>Affected Area:</strong> ${report.patientSummary.affectedArea}</p>
    ${report.patientSummary.conversationSummary ? `<p><strong>Conversation Summary:</strong> ${report.patientSummary.conversationSummary}</p>` : ''}
  </div>

  <h2>Triage Assessment</h2>
  <div class="section" style="text-align: center;">
    <div class="triage-badge triage-${report.triageAssessment.color.toLowerCase()}">${report.triageAssessment.category}</div>
    <p style="margin-top: 15px;"><strong>Urgency:</strong> ${report.triageAssessment.urgency}</p>
    <p><strong>Rationale:</strong> ${report.triageAssessment.rationale}</p>
  </div>

  ${report.redFlags.length > 0 ? `
  <h2>Warning Signs</h2>
  ${report.redFlags.map(rf => `
    <div class="red-flag">
      <strong>${rf.flag}</strong><br/>
      <small>${rf.significance}</small><br/>
      <em>Action: ${rf.action}</em>
    </div>
  `).join('')}
  ` : ''}

  <h2>Recommendations</h2>
  <div class="section">
    ${report.recommendations.immediate.length > 0 ? `
    <h3>Immediate Actions</h3>
    <ul>${report.recommendations.immediate.map(r => `<li>${r}</li>`).join('')}</ul>
    ` : ''}
    ${report.recommendations.selfCare.length > 0 ? `
    <h3>Self-Care Instructions</h3>
    <ul>${report.recommendations.selfCare.map(r => `<li>${r}</li>`).join('')}</ul>
    ` : ''}
    ${report.recommendations.whenToSeekCare.length > 0 ? `
    <h3>When to Seek Emergency Care</h3>
    <ul>${report.recommendations.whenToSeekCare.map(r => `<li class="recommendation">${r}</li>`).join('')}</ul>
    ` : ''}
    ${report.recommendations.followUp ? `<p><strong>Follow-up:</strong> ${report.recommendations.followUp}</p>` : ''}
  </div>

  <h2>AI Analysis Confidence</h2>
  <div class="section" style="text-align: center;">
    <div class="metric"><div class="metric-value">${report.confidenceMetrics.overall}%</div><div class="metric-label">Overall</div></div>
    <div class="metric"><div class="metric-value">${report.confidenceMetrics.voiceAnalysis}%</div><div class="metric-label">Voice</div></div>
    <div class="metric"><div class="metric-value">${report.confidenceMetrics.visualAnalysis}%</div><div class="metric-label">Visual</div></div>
  </div>

  <div class="disclaimer">${report.disclaimer}</div>
</body>
</html>`;
  };

  const getTriageColor = (color: string) => {
    switch (color?.toUpperCase()) {
      case 'RED': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'ORANGE':
      case 'AMBER': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      case 'YELLOW': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'GREEN': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
      default: return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
    }
  };

  // Initial view - Generate Report button
  if (!report && !isGenerating) {
    return (
      <Card className="p-8 bg-gradient-to-br from-background via-card to-background border-primary/30 text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
            <FileText className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Generate Comprehensive Report
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get a detailed AI-powered medical assessment report based on your consultation, 
            including voice analysis, visual findings, and personalized recommendations.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <span>{session.messages.length} voice interactions</span>
          </div>
          <div className="flex items-center gap-2">
            <CameraIcon className="w-4 h-4 text-secondary" />
            <span>{visionResults.length} visual analyses</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span>{Math.round((Date.now() - session.startTime.getTime()) / 1000 / 60)} min session</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={generateReport}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate Full Report
          </Button>
          <Button size="lg" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
            {error}
          </div>
        )}
      </Card>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <Card className="p-8 bg-gradient-to-br from-background via-card to-background border-primary/30 text-center space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full border-4 border-secondary/20" />
          <div className="absolute inset-4 rounded-full border-4 border-secondary border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Generating Your Report
          </h2>
          <p className="text-muted-foreground">
            Our AI is analyzing your consultation data...
          </p>
        </div>

        <div className="space-y-3 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-foreground">Processing voice transcripts</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-foreground">Analyzing visual data</span>
          </div>
          <div className="flex items-center gap-3 text-sm animate-pulse">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-foreground">Generating recommendations</span>
          </div>
        </div>
      </Card>
    );
  }

  // Full report view
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-primary/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Medical Consultation Report
                </h1>
                <p className="text-sm text-muted-foreground">
                  Report ID: {report!.reportId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(report!.generatedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {report!.sessionDuration}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Triage Status Hero */}
      <Card className={`p-6 border-2 ${getTriageColor(report!.triageAssessment.color)}`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${getTriageColor(report!.triageAssessment.color)}`}>
            <Activity className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <Badge className={`mb-2 ${getTriageColor(report!.triageAssessment.color)}`}>
              {report!.triageAssessment.category}
            </Badge>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {report!.triageAssessment.urgency}
            </h2>
            <p className="text-muted-foreground">
              {report!.triageAssessment.rationale}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">
              {report!.triageAssessment.level}
            </div>
            <div className="text-sm text-muted-foreground">Triage Level</div>
          </div>
        </div>
      </Card>

      {/* Patient Summary */}
      <Card className="overflow-hidden border-border/50">
        <button 
          onClick={() => toggleSection('summary')}
          className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Patient Summary</span>
          </div>
          {expandedSections.summary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.summary && (
          <div className="p-6 border-t border-border/50 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Chief Complaint</span>
                <p className="font-medium text-foreground mt-1">{report!.patientSummary.chiefComplaint}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Affected Area</span>
                <p className="font-medium text-foreground mt-1">{report!.patientSummary.affectedArea}</p>
              </div>
            </div>
            
            {report!.patientSummary.presentingSymptoms.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground">Presenting Symptoms</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {report!.patientSummary.presentingSymptoms.map((symptom, i) => (
                    <Badge key={i} variant="secondary">{symptom}</Badge>
                  ))}
                </div>
              </div>
            )}

            {report!.patientSummary.conversationSummary && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-xs text-muted-foreground">Conversation Summary</span>
                <p className="text-sm text-foreground mt-1">{report!.patientSummary.conversationSummary}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Clinical Findings */}
      <Card className="overflow-hidden border-border/50">
        <button 
          onClick={() => toggleSection('clinical')}
          className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-secondary" />
            </div>
            <span className="font-semibold text-foreground">Clinical Findings</span>
          </div>
          {expandedSections.clinical ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.clinical && (
          <div className="p-6 border-t border-border/50 space-y-6">
            {/* Visual Assessment */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Visual Assessment</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {report!.clinicalFindings.visualAssessment.inflammationScore}/10
                  </div>
                  <div className="text-xs text-muted-foreground">Inflammation</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-foreground capitalize">
                    {report!.clinicalFindings.visualAssessment.redness}
                  </div>
                  <div className="text-xs text-muted-foreground">Redness</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-foreground capitalize">
                    {report!.clinicalFindings.visualAssessment.swelling}
                  </div>
                  <div className="text-xs text-muted-foreground">Swelling</div>
                </div>
              </div>
              
              {report!.clinicalFindings.visualAssessment.findings.length > 0 && (
                <ul className="space-y-2">
                  {report!.clinicalFindings.visualAssessment.findings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">{finding}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Symptom Analysis */}
            {report!.clinicalFindings.symptomAnalysis.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-foreground">Symptom Analysis</span>
                </div>
                <ul className="space-y-2">
                  {report!.clinicalFindings.symptomAnalysis.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Target className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Red Flags */}
      {report!.redFlags.length > 0 && (
        <Card className="p-6 bg-red-500/5 border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-semibold text-red-500">Warning Signs Detected</span>
          </div>
          <div className="space-y-3">
            {report!.redFlags.map((flag, i) => (
              <div key={i} className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
                <p className="font-medium text-red-600">{flag.flag}</p>
                <p className="text-sm text-red-500/80 mt-1">{flag.significance}</p>
                <p className="text-sm text-red-600 font-medium mt-2">
                  ➜ {flag.action}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="overflow-hidden border-border/50">
        <button 
          onClick={() => toggleSection('recommendations')}
          className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="font-semibold text-foreground">Recommendations</span>
          </div>
          {expandedSections.recommendations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expandedSections.recommendations && (
          <div className="p-6 border-t border-border/50 space-y-6">
            {/* Immediate Actions */}
            {report!.recommendations.immediate.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-foreground">Immediate Actions</span>
                </div>
                <div className="space-y-2">
                  {report!.recommendations.immediate.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg">
                      <span className="w-6 h-6 flex items-center justify-center bg-amber-500 text-white text-sm font-bold rounded-full shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Self-Care */}
            {report!.recommendations.selfCare.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="font-medium text-foreground">Self-Care Instructions</span>
                </div>
                <ul className="grid md:grid-cols-2 gap-2">
                  {report!.recommendations.selfCare.map((care, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-pink-500/10 rounded-lg text-sm">
                      <Pill className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">{care}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* When to Seek Care */}
            {report!.recommendations.whenToSeekCare.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-foreground">When to Seek Emergency Care</span>
                </div>
                <ul className="space-y-2">
                  {report!.recommendations.whenToSeekCare.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-red-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up */}
            {report!.recommendations.followUp && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Follow-up Plan</span>
                </div>
                <p className="text-sm text-muted-foreground">{report!.recommendations.followUp}</p>
              </div>
            )}

            {/* Specialist Referral */}
            {report!.recommendations.specialistReferral && (
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-foreground">
                    Specialist Referral: {report!.recommendations.specialistType}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* AI Confidence */}
      <Card className="p-6 border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">AI Analysis Confidence</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall', value: report!.confidenceMetrics.overall, color: 'primary' },
            { label: 'Voice Analysis', value: report!.confidenceMetrics.voiceAnalysis, color: 'secondary' },
            { label: 'Visual Analysis', value: report!.confidenceMetrics.visualAnalysis, color: 'accent' },
            { label: 'Triage Accuracy', value: report!.confidenceMetrics.triageAccuracy, color: 'emerald-500' },
          ].map((metric, i) => (
            <div key={i} className="text-center p-4 bg-muted/30 rounded-xl">
              <div className={`text-3xl font-bold text-${metric.color}`}>
                {metric.value}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
              <Progress value={metric.value} className="h-1.5 mt-2" />
            </div>
          ))}
        </div>

        {report!.aiAnalysis.multimodalCorrelation && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <span className="text-xs text-muted-foreground">Multimodal Correlation</span>
            <p className="text-sm text-foreground mt-1">{report!.aiAnalysis.multimodalCorrelation}</p>
          </div>
        )}
      </Card>

      {/* Disclaimer */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          {report!.disclaimer}
        </p>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button size="lg" variant="outline" onClick={onClose}>
          Close Report
        </Button>
        <Button size="lg" onClick={() => window.location.reload()} className="gap-2">
          <Activity className="w-5 h-5" />
          New Consultation
        </Button>
      </div>
    </div>
  );
}
