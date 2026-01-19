import { motion } from 'framer-motion';
import { 
  FileText, AlertTriangle, CheckCircle, XCircle, Clock, 
  Pill, Activity, Brain, HelpCircle, Shield, TrendingUp,
  Stethoscope, AlertCircle, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { DocumentAnalysisResult as AnalysisResult } from '@/types/document-analysis';
import { Button } from '@/components/ui/button';

interface DocumentAnalysisResultProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

const statusColors = {
  normal: 'bg-green-500/10 text-green-500 border-green-500/30',
  abnormal_high: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  abnormal_low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  critical: 'bg-red-500/10 text-red-500 border-red-500/30',
};

const severityColors = {
  low: 'bg-green-500/10 text-green-500',
  moderate: 'bg-amber-500/10 text-amber-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

export function DocumentAnalysisResultView({ result, onNewAnalysis }: DocumentAnalysisResultProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (result.error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center"
      >
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
        <p className="text-muted-foreground mb-4">{result.error}</p>
        <Button onClick={onNewAnalysis}>Try Again</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Executive Summary - Most Important */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {result.executiveSummary}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Document Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Document Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="font-medium">{result.documentOverview.documentType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-medium">{result.documentOverview.dateOfTest}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Source</p>
                <p className="font-medium">{result.documentOverview.source || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Body Systems</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.documentOverview.bodySystemsInvolved.map((system, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{system}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Diagnosis */}
      <motion.div variants={itemVariants}>
        <Card className="border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5 text-amber-500" />
              Diagnosis
              <Badge className="ml-auto" variant="outline">
                {result.diagnosis.confidence}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Primary Diagnosis</p>
              <p className="text-lg font-semibold text-foreground">{result.diagnosis.primaryDiagnosis}</p>
            </div>
            
            {result.diagnosis.differentialDiagnoses.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Differential Diagnoses</p>
                <div className="flex flex-wrap gap-2">
                  {result.diagnosis.differentialDiagnoses.map((dx, i) => (
                    <Badge key={i} variant="outline">{dx}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Supporting Evidence</p>
              <ul className="space-y-1">
                {result.diagnosis.supportingEvidence.map((evidence, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{evidence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Findings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              Key Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.keyFindings.map((finding, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg border ${statusColors[finding.status]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{finding.finding}</p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">{finding.value}</span>
                        {finding.referenceRange && (
                          <span className="text-muted-foreground"> (Ref: {finding.referenceRange})</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {finding.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {finding.clinicalRelevance} relevance
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Treatment Recommendations */}
      <motion.div variants={itemVariants}>
        <Card className="border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="w-5 h-5 text-green-500" />
              Treatment Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.treatmentRecommendations.medications.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Medications</p>
                <div className="space-y-3">
                  {result.treatmentRecommendations.medications.map((med, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{med.drug}</span>
                      </div>
                      <p className="text-sm">
                        {med.dosage} • {med.frequency} • {med.duration}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{med.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.treatmentRecommendations.procedures.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Procedures</p>
                <ul className="space-y-1">
                  {result.treatmentRecommendations.procedures.map((proc, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      {proc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.treatmentRecommendations.lifestyle.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Lifestyle Modifications</p>
                <ul className="space-y-1">
                  {result.treatmentRecommendations.lifestyle.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.treatmentRecommendations.monitoring.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Monitoring</p>
                <ul className="space-y-1">
                  {result.treatmentRecommendations.monitoring.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Flags */}
      {result.riskAndAttentionFlags.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Risk & Attention Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.riskAndAttentionFlags.map((flag, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg ${severityColors[flag.severity]} border border-current/20`}
                  >
                    <div className="flex items-start gap-3">
                      {flag.requiresImmediateAttention ? (
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{flag.flag}</p>
                        <p className="text-sm mt-1">{flag.action}</p>
                        <Badge variant="outline" className="mt-2 text-xs capitalize">
                          {flag.severity} severity
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeline & Progression */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Timeline & Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {result.timelineAndProgression.acuteOrChronic}
              </Badge>
            </div>
            {result.timelineAndProgression.progressionIndicators.length > 0 && (
              <ul className="space-y-1">
                {result.timelineAndProgression.progressionIndicators.map((indicator, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-primary" />
                    {indicator}
                  </li>
                ))}
              </ul>
            )}
            {result.timelineAndProgression.comparisonNotes && (
              <p className="text-sm text-muted-foreground">
                {result.timelineAndProgression.comparisonNotes}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Questions for Doctor */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="w-5 h-5" />
              Questions for Clinical Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.questionsForDoctor.map((question, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {question}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confidence & Limitations */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Confidence & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Confidence</span>
                <span className="text-sm font-bold">{result.confidenceAndLimitations.overallConfidence}%</span>
              </div>
              <Progress value={result.confidenceAndLimitations.overallConfidence} className="h-2" />
            </div>
            
            <Separator />
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Supports</p>
                <ul className="space-y-1">
                  {result.confidenceAndLimitations.whatDocumentSupports.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Cannot Conclude</p>
                <ul className="space-y-1">
                  {result.confidenceAndLimitations.whatCannotBeConcluded.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Needs Human Review</p>
                <ul className="space-y-1">
                  {result.confidenceAndLimitations.whereHumanJudgmentRequired.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Safety Statement */}
      <motion.div variants={itemVariants}>
        <div className="p-4 rounded-lg bg-muted/50 border text-center">
          <Shield className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {result.safetyStatement}
          </p>
        </div>
      </motion.div>

      {/* New Analysis Button */}
      <motion.div variants={itemVariants}>
        <Button 
          onClick={onNewAnalysis} 
          variant="outline" 
          className="w-full"
        >
          Analyze Another Document
        </Button>
      </motion.div>
    </motion.div>
  );
}
