import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LiveMessage, LiveVisionResult, LiveTriageResult, LiveSession } from '@/types/live';
import { useToast } from '@/hooks/use-toast';

export const useLiveSession = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTriage, setCurrentTriage] = useState<LiveTriageResult | null>(null);
  const [latestVision, setLatestVision] = useState<LiveVisionResult | null>(null);
  const conversationHistoryRef = useRef<{ role: string; content: string }[]>([]);

  const startSession = useCallback(() => {
    const newSession: LiveSession = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      messages: [],
      visionResults: [],
    };
    setSession(newSession);
    conversationHistoryRef.current = [];
    setCurrentTriage(null);
    setLatestVision(null);
  }, []);

  const endSession = useCallback(() => {
    if (session) {
      setSession({
        ...session,
        endTime: new Date(),
        finalTriage: currentTriage || undefined,
      });
    }
  }, [session, currentTriage]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: LiveMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    };
    
    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
    } : null);

    conversationHistoryRef.current.push({ role, content });
  }, []);

  const processVoiceInput = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessing) return null;

    setIsProcessing(true);
    addMessage('user', transcript);

    try {
      const { data, error } = await supabase.functions.invoke('ai-live-triage', {
        body: {
          transcript,
          conversationHistory: conversationHistoryRef.current,
          imageAnalysis: latestVision,
        },
      });

      if (error) throw error;

      const result = data as LiveTriageResult;
      
      if (result.response) {
        addMessage('assistant', result.response);
      }

      setCurrentTriage(result);
      return result;

    } catch (error) {
      console.error('Voice processing error:', error);
      toast({
        title: 'Processing Error',
        description: 'Unable to process your input. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, addMessage, latestVision, toast]);

  const analyzeFrame = useCallback(async (imageBase64: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-live-vision', {
        body: { imageBase64 },
      });

      if (error) throw error;

      const result = data as LiveVisionResult;
      setLatestVision(result);

      setSession(prev => prev ? {
        ...prev,
        visionResults: [...prev.visionResults, result],
      } : null);

      return result;

    } catch (error) {
      console.error('Vision analysis error:', error);
      return null;
    }
  }, []);

  return {
    session,
    isProcessing,
    currentTriage,
    latestVision,
    startSession,
    endSession,
    addMessage,
    processVoiceInput,
    analyzeFrame,
  };
};
