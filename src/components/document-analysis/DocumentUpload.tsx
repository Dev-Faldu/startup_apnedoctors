import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, FileType, Stethoscope, TestTube, Activity, Pill, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DocumentType } from '@/types/document-analysis';

interface DocumentUploadProps {
  file: File | null;
  documentType: DocumentType;
  patientContext: string;
  onFileChange: (file: File | null) => void;
  onDocumentTypeChange: (type: DocumentType) => void;
  onPatientContextChange: (context: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const documentTypes: { value: DocumentType; label: string; icon: React.ReactNode }[] = [
  { value: 'lab_report', label: 'Lab Report', icon: <TestTube className="w-4 h-4" /> },
  { value: 'radiology_report', label: 'Radiology', icon: <Activity className="w-4 h-4" /> },
  { value: 'discharge_summary', label: 'Discharge Summary', icon: <FileText className="w-4 h-4" /> },
  { value: 'prescription', label: 'Prescription', icon: <Pill className="w-4 h-4" /> },
  { value: 'pathology_report', label: 'Pathology', icon: <Stethoscope className="w-4 h-4" /> },
  { value: 'ecg_report', label: 'ECG Report', icon: <Heart className="w-4 h-4" /> },
  { value: 'general_medical', label: 'General Medical', icon: <FileType className="w-4 h-4" /> },
];

export function DocumentUpload({
  file,
  documentType,
  patientContext,
  onFileChange,
  onDocumentTypeChange,
  onPatientContextChange,
  onAnalyze,
  isAnalyzing,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  }, [onFileChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${file 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {file ? (
            <div className="flex items-center justify-center gap-4">
              <FileText className="w-12 h-12 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Upload Medical Document
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: PDF, TXT, DOC, DOCX
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Document Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <Label className="text-sm font-medium">Document Type</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {documentTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onDocumentTypeChange(type.value)}
              className={`
                flex items-center gap-2 p-3 rounded-lg border text-sm transition-all
                ${documentType === type.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Patient Context (Optional) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <Label htmlFor="patientContext" className="text-sm font-medium">
          Patient Context <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="patientContext"
          placeholder="Add any relevant patient history, symptoms, or context that may help with analysis..."
          value={patientContext}
          onChange={(e) => onPatientContextChange(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </motion.div>

      {/* Analyze Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onAnalyze}
          disabled={!file || isAnalyzing}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Stethoscope className="w-5 h-5 mr-2" />
              Analyze Document
            </>
          )}
        </Button>
      </motion.div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        AI-powered analysis for clinical decision support. Always verify with clinical judgment.
      </p>
    </div>
  );
}
