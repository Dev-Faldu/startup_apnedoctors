import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LiveMessage, LiveVisionResult, LiveTriageResult, LiveSession } from '@/types/live';
import { useToast } from '@/hooks/use-toast';

export const useLiveSession = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTriage, setCurrentTriage] = useState<LiveTriageResult | null>(null);
  const [latestVision, setLatestVision] = useState<LiveVisionResult | null>(null);
  const conversationHistoryRef = useRef<{ role: string; content: string }[]>([]);

  // Subscribe to real-time transcript updates
  useEffect(() => {
    if (!dbSessionId) return;

    const channel = supabase
      .channel(`session-${dbSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_transcripts',
          filter: `session_id=eq.${dbSessionId}`,
        },
        (payload) => {
          console.log('Real-time transcript:', payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_vision_detections',
          filter: `session_id=eq.${dbSessionId}`,
        },
        (payload) => {
          console.log('Real-time vision detection:', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbSessionId]);

  const startSession = useCallback(async () => {
    try {
      // Create session in database
      const { data: dbSession, error } = await supabase
        .from('live_sessions')
        .insert({
          status: 'active',
          triage_level: 'GREEN',
        })
        .select()
        .single();

      if (error) throw error;

      setDbSessionId(dbSession.id);

      const newSession: LiveSession = {
        id: dbSession.id,
        startTime: new Date(dbSession.started_at),
        messages: [],
        visionResults: [],
      };
      setSession(newSession);
      conversationHistoryRef.current = [];
      setCurrentTriage(null);
      setLatestVision(null);

      console.log('Session started:', dbSession.id);
      return dbSession.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      toast({
        title: 'Session Error',
        description: 'Failed to start consultation session.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const endSession = useCallback(async () => {
    if (!session || !dbSessionId) return;

    try {
      // Update session in database
      const { error } = await supabase
        .from('live_sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          triage_level: currentTriage?.triageLevel || 'GREEN',
          summary: currentTriage?.extractedInfo 
            ? JSON.stringify(currentTriage.extractedInfo) 
            : null,
        })
        .eq('id', dbSessionId);

      if (error) throw error;

      setSession({
        ...session,
        endTime: new Date(),
        finalTriage: currentTriage || undefined,
      });

      console.log('Session ended:', dbSessionId);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [session, dbSessionId, currentTriage]);

  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string) => {
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

    // Save to database
    if (dbSessionId) {
      try {
        await supabase
          .from('live_transcripts')
          .insert({
            session_id: dbSessionId,
            role,
            content,
          });
      } catch (error) {
        console.error('Failed to save transcript:', error);
      }
    }
  }, [dbSessionId]);

  const processVoiceInput = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessing) return null;

    setIsProcessing(true);
    await addMessage('user', transcript);

    try {
      const { data, error } = await supabase.functions.invoke('ai-live-triage', {
        body: {
          transcript,
          conversationHistory: conversationHistoryRef.current,
          imageAnalysis: latestVision,
          sessionId: dbSessionId,
        },
      });

      if (error) throw error;

      const result = data as LiveTriageResult;
      
      if (result.response) {
        await addMessage('assistant', result.response);
      }

      // Update triage level in database
      if (result.triageLevel && dbSessionId) {
        await supabase
          .from('live_sessions')
          .update({ triage_level: result.triageLevel })
          .eq('id', dbSessionId);
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
  }, [isProcessing, addMessage, latestVision, dbSessionId, toast]);

  const analyzeFrame = useCallback(async (imageBase64: string) => {
    if (!imageBase64 || imageBase64.length < 1000) {
      console.log('Invalid frame, skipping analysis');
      return null;
    }

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

      // Save detections to database
      if (dbSessionId && result.detections?.length > 0) {
        const detectionsToInsert = result.detections.map(d => ({
          session_id: dbSessionId,
          detection_type: d.type,
          severity: d.severity,
          location: d.location,
          confidence: d.confidence,
        }));

        await supabase
          .from('live_vision_detections')
          .insert(detectionsToInsert);
      }

      return result;

    } catch (error) {
      console.error('Vision analysis error:', error);
      return null;
    }
  }, [dbSessionId]);

  return {
    session,
    dbSessionId,
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
