import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentType, DocumentAnalysisResult, DocumentUploadState } from '@/types/document-analysis';

export function useDocumentAnalysis() {
  const [state, setState] = useState<DocumentUploadState>({
    file: null,
    documentType: 'unknown',
    patientContext: '',
    isAnalyzing: false,
    error: null,
    result: null,
  });

  const setFile = useCallback((file: File | null) => {
    setState(prev => ({ ...prev, file, error: null, result: null }));
  }, []);

  const setDocumentType = useCallback((documentType: DocumentType) => {
    setState(prev => ({ ...prev, documentType }));
  }, []);

  const setPatientContext = useCallback((patientContext: string) => {
    setState(prev => ({ ...prev, patientContext }));
  }, []);

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          // For text files, return directly
          resolve(content);
        } else {
          reject(new Error('Could not read file content'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      // For now, read as text. In production, you'd use OCR for PDFs/images
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        // For demo purposes, try to read as text
        // In production, integrate with an OCR service
        reader.readAsText(file);
      }
    });
  };

  const analyzeDocument = useCallback(async () => {
    if (!state.file) {
      setState(prev => ({ ...prev, error: 'Please select a document to analyze' }));
      return;
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Extract text content from file
      const documentContent = await extractTextFromFile(state.file);
      
      if (!documentContent.trim()) {
        throw new Error('Could not extract text from document. Please ensure the document contains readable text.');
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('ai-document-analysis', {
        body: {
          documentContent,
          documentType: state.documentType,
          patientContext: state.patientContext || undefined,
        },
      });

      if (error) throw error;
      
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        result: data as DocumentAnalysisResult,
        error: null,
      }));
      
    } catch (error) {
      console.error('Document analysis error:', error);
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze document',
      }));
    }
  }, [state.file, state.documentType, state.patientContext]);

  const reset = useCallback(() => {
    setState({
      file: null,
      documentType: 'unknown',
      patientContext: '',
      isAnalyzing: false,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    setFile,
    setDocumentType,
    setPatientContext,
    analyzeDocument,
    reset,
  };
}
