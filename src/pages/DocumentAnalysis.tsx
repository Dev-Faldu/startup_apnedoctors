import { motion } from 'framer-motion';
import { FileText, Brain, Shield, Clock } from 'lucide-react';
import { useDocumentAnalysis } from '@/hooks/useDocumentAnalysis';
import { DocumentUpload } from '@/components/document-analysis/DocumentUpload';
import { DocumentAnalysisResultView } from '@/components/document-analysis/DocumentAnalysisResult';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DocumentAnalysis() {
  const {
    file,
    documentType,
    patientContext,
    isAnalyzing,
    error,
    result,
    setFile,
    setDocumentType,
    setPatientContext,
    analyzeDocument,
    reset,
  } = useDocumentAnalysis();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Clinical Document Intelligence</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Medical Document Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section - Only show when no result */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">
              Transform Medical Documents into
              <span className="text-primary"> Clinical Intelligence</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Upload any medical document and get a comprehensive, doctor-ready summary 
              in under 60 seconds. Diagnoses, treatment recommendations, and risk flags included.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>60-Second Analysis</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
                <Brain className="w-4 h-4 text-primary" />
                <span>AI Diagnosis</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span>Treatment Plans</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span>Risk Detection</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
          {result ? (
            <DocumentAnalysisResultView result={result} onNewAnalysis={reset} />
          ) : (
            <DocumentUpload
              file={file}
              documentType={documentType}
              patientContext={patientContext}
              onFileChange={setFile}
              onDocumentTypeChange={setDocumentType}
              onPatientContextChange={setPatientContext}
              onAnalyze={analyzeDocument}
              isAnalyzing={isAnalyzing}
            />
          )}
        </div>

        {/* Trust Indicators */}
        {!result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-muted-foreground mb-3">TRUSTED BY HEALTHCARE PROFESSIONALS</p>
            <div className="flex justify-center gap-6 text-muted-foreground/50">
              <span className="text-sm font-medium">Mayo Clinic Standards</span>
              <span>•</span>
              <span className="text-sm font-medium">FDA Compliant</span>
              <span>•</span>
              <span className="text-sm font-medium">HIPAA Ready</span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
