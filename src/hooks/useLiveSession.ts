import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LiveMessage, LiveVisionResult, LiveTriageResult, LiveSession } from '@/types/live';
import { useToast } from '@/hooks/use-toast';

export const useLiveSession = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTriage, setCurrentTriage] = useState<LiveTriageResult | null>(null);
  const [latestVision, setLatestVision] = useState<LiveVisionResult | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [triageError, setTriageError] = useState<string | null>(null);
  const conversationHistoryRef = useRef<{ role: string; content: string }[]>([]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!dbSessionId) return;

    console.log('Setting up real-time subscriptions for session:', dbSessionId);
    setIsConnected(true);

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
          console.log('Real-time transcript received:', payload.new);
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_sessions',
          filter: `id=eq.${dbSessionId}`,
        },
        (payload) => {
          console.log('Session updated:', payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [dbSessionId]);

  const startSession = useCallback(async () => {
    try {
      console.log('Starting new live session...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to start a session.',
          variant: 'destructive',
        });
        return null;
      }
      
      // Ensure patient record exists for this user
      let patientId: string;
      
      // First check if patient already exists with this user's email
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (existingPatient) {
        patientId = existingPatient.id;
        console.log('Using existing patient record:', patientId);
      } else {
        // Create a new patient record using the auth user's ID
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient',
          })
          .select('id')
          .single();
        
        if (patientError) {
          console.error('Error creating patient record:', patientError);
          throw new Error('Failed to create patient record');
        }
        
        patientId = newPatient.id;
        console.log('Created new patient record:', patientId);
      }
      
      // Create session in database with the patient_id
      const { data: dbSession, error } = await supabase
        .from('live_sessions')
        .insert({
          patient_id: patientId,
          status: 'active',
          triage_level: 'GREEN',
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating session:', error);
        throw error;
      }

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
      setVisionError(null);
      setTriageError(null);

      console.log('Session started successfully:', dbSession.id);
      
      toast({
        title: 'Session Started',
        description: 'Your AI medical consultation is now active.',
      });

      return dbSession.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      toast({
        title: 'Session Error',
        description: 'Failed to start consultation session. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const endSession = useCallback(async () => {
    if (!session || !dbSessionId) return;

    try {
      console.log('Ending session:', dbSessionId);
      
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

      if (error) {
        console.error('Error updating session:', error);
        throw error;
      }

      setSession({
        ...session,
        endTime: new Date(),
        finalTriage: currentTriage || undefined,
      });

      toast({
        title: 'Session Complete',
        description: `Triage level: ${currentTriage?.triageLevel || 'GREEN'}`,
      });

      console.log('Session ended successfully');
    } catch (error) {
      console.error('Failed to end session:', error);
      toast({
        title: 'Error',
        description: 'Failed to save session data.',
        variant: 'destructive',
      });
    }
  }, [session, dbSessionId, currentTriage, toast]);

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
        const { error } = await supabase
          .from('live_transcripts')
          .insert({
            session_id: dbSessionId,
            role,
            content,
          });
        
        if (error) {
          console.error('Failed to save transcript:', error);
        } else {
          console.log('Transcript saved:', role, content.substring(0, 30));
        }
      } catch (error) {
        console.error('Failed to save transcript:', error);
      }
    }
  }, [dbSessionId]);

  const processVoiceInput = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessing) {
      console.log('Skipping voice input:', !transcript.trim() ? 'empty' : 'already processing');
      return null;
    }

    setIsProcessing(true);
    setTriageError(null);
    
    await addMessage('user', transcript);

    try {
      console.log('Sending voice input for triage analysis...');
      
      // Get auth session for the request
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('ai-live-triage', {
        body: {
          transcript,
          conversationHistory: conversationHistoryRef.current,
          imageAnalysis: latestVision,
          sessionId: dbSessionId,
        },
      });

      if (error) {
        console.error('Triage function error:', error);
        throw error;
      }

      const result = data as LiveTriageResult;
      
      console.log('Triage response received:', {
        hasResponse: !!result.response,
        triageLevel: result.triageLevel,
        shouldEscalate: result.shouldEscalate
      });

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
      
      // Show toast for escalation
      if (result.shouldEscalate) {
        toast({
          title: 'Urgent Concern Detected',
          description: 'Based on your symptoms, immediate medical attention may be needed.',
          variant: 'destructive',
        });
      }

      return result;

    } catch (error: any) {
      console.error('Voice processing error:', error);
      
      const errorMsg = error?.message || 'Unable to process your input';
      setTriageError(errorMsg);
      
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
      console.log('Invalid frame, skipping analysis. Length:', imageBase64?.length || 0);
      return null;
    }

    setVisionError(null);

    try {
      console.log('Sending frame for vision analysis...');
      
      const { data, error } = await supabase.functions.invoke('ai-live-vision', {
        body: { 
          imageBase64,
          sessionId: dbSessionId 
        },
      });

      if (error) {
        console.error('Vision function error:', error);
        throw error;
      }

      const result = data as LiveVisionResult;
      
      console.log('Vision result received:', {
        detections: result.detections?.length || 0,
        concernLevel: result.concernLevel
      });

      setLatestVision(result);

      setSession(prev => prev ? {
        ...prev,
        visionResults: [...prev.visionResults, result],
      } : null);

      // Detections are now saved in the edge function
      return result;

    } catch (error: any) {
      console.error('Vision analysis error:', error);
      setVisionError(error?.message || 'Vision analysis failed');
      return null;
    }
  }, [dbSessionId]);

  const retryConnection = useCallback(async () => {
    if (!dbSessionId) return;
    
    console.log('Retrying connection...');
    setIsConnected(false);
    
    // Force resubscribe by updating dbSessionId
    const currentId = dbSessionId;
    setDbSessionId(null);
    setTimeout(() => setDbSessionId(currentId), 100);
  }, [dbSessionId]);

  return {
    session,
    dbSessionId,
    isProcessing,
    isConnected,
    currentTriage,
    latestVision,
    visionError,
    triageError,
    startSession,
    endSession,
    addMessage,
    processVoiceInput,
    analyzeFrame,
    retryConnection,
  };
};
