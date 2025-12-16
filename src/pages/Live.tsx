import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLiveCamera } from '@/hooks/useLiveCamera';
import { useLiveSession } from '@/hooks/useLiveSession';
import { VoiceWaveform } from '@/components/live/VoiceWaveform';
import { LiveTranscript } from '@/components/live/LiveTranscript';
import { VisionOverlay } from '@/components/live/VisionOverlay';
import { TriageIndicator } from '@/components/live/TriageIndicator';
import {
  Video,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Camera,
  FileText,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const Live = () => {
  const navigate = useNavigate();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisRef = useRef<number>(0);

  const {
    videoRef,
    canvasRef,
    isActive: isCameraActive,
    isVideoReady,
    error: cameraError,
    permissionDenied,
    startCamera,
    stopCamera,
    captureFrame,
    retryCamera,
  } = useLiveCamera();

  const {
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
    processVoiceInput,
    analyzeFrame,
  } = useLiveSession();

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  const {
    isListening,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    silenceTimeout: 2000,
  });

  // Handle silence - process voice input when user stops speaking
  useEffect(() => {
    if (!transcript || isProcessing || !isSessionActive) return;
    
    const timer = setTimeout(async () => {
      if (transcript) {
        console.log('Silence detected, processing transcript...');
        const result = await processVoiceInput(transcript);
        resetTranscript();
        
        if (result?.response) {
          speak(result.response);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [transcript, isProcessing, isSessionActive, processVoiceInput, resetTranscript, speak]);

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      await startCamera();
      // Give browser time to initialize video element
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sessionId = await startSession();
      if (!sessionId) {
        stopCamera();
        return;
      }
      startListening();
      setIsSessionActive(true);
    } catch (error) {
      console.error('Failed to start session:', error);
      stopCamera();
    } finally {
      setIsStarting(false);
    }
  };

  // Start frame analysis when video is ready
  useEffect(() => {
    if (isSessionActive && isVideoReady && dbSessionId) {
      console.log('Starting frame analysis interval');
      
      // Analyze immediately
      const analyzeNow = async () => {
        const now = Date.now();
        if (now - lastAnalysisRef.current < 4000) return; // Debounce
        
        const frame = captureFrame();
        if (frame) {
          lastAnalysisRef.current = now;
          setIsAnalyzingFrame(true);
          await analyzeFrame(frame);
          setIsAnalyzingFrame(false);
        }
      };

      analyzeNow();

      frameIntervalRef.current = setInterval(analyzeNow, 5000);

      return () => {
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
      };
    }
  }, [isSessionActive, isVideoReady, dbSessionId, captureFrame, analyzeFrame]);

  const handleEndSession = async () => {
    stopListening();
    stopCamera();
    stopSpeaking();
    await endSession();
    setIsSessionActive(false);

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  const handleCaptureNow = async () => {
    const frame = captureFrame();
    if (frame) {
      setIsAnalyzingFrame(true);
      await analyzeFrame(frame);
      setIsAnalyzingFrame(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <canvas ref={canvasRef} className="hidden" />

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Connection Status */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">
                <span className="text-primary">AI</span> Medical Consultation
              </h1>
              {isSessionActive && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  isConnected ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isConnected ? 'Connected' : 'Connecting...'}
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              {isSessionActive
                ? 'AI Doctor is listening. Describe your symptoms or show your injury.'
                : 'Start a live consultation with our AI medical assistant'}
            </p>
            {dbSessionId && (
              <p className="text-xs text-muted-foreground/60">
                Session: {dbSessionId.substring(0, 8)}...
              </p>
            )}
          </div>

          {/* Error Display */}
          {(cameraError || visionError || triageError) && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <div className="text-sm text-destructive">
                {cameraError || visionError || triageError}
              </div>
              {cameraError && (
                <Button size="sm" variant="outline" onClick={retryCamera} className="ml-auto">
                  <RefreshCw className="w-4 h-4 mr-1" /> Retry
                </Button>
              )}
            </div>
          )}

          {/* Main Video Area */}
          <Card className="relative aspect-video bg-card/50 border-primary/20 overflow-hidden">
            {/* Always render video so the ref is available when camera starts */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Overlays based on camera state */}
            {(!isCameraActive || !isVideoReady) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-muted-foreground">
                {isCameraActive ? (
                  <>
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p>Initializing camera...</p>
                  </>
                ) : (
                  <>
                    <Video className="w-16 h-16 mb-4 opacity-50" />
                    <p>Camera will activate when session starts</p>
                    {permissionDenied && (
                      <p className="text-destructive text-sm mt-2 max-w-md text-center px-4">
                        Camera access denied. Please enable camera permission in your browser settings and refresh the page.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Vision overlay when we have video */}
            {isCameraActive && isVideoReady && (
              <VisionOverlay
                detections={latestVision?.detections || []}
                concernLevel={latestVision?.concernLevel || 'low'}
                isAnalyzing={isAnalyzingFrame}
              />
            )}

            {isSessionActive && isVideoReady && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-3 flex items-center gap-4">
                  <VoiceWaveform
                    isActive={isListening && !!transcript}
                    isSpeaking={isSpeaking}
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant={isListening ? 'default' : 'outline'}
                      onClick={isListening ? stopListening : startListening}
                      title={isListening ? 'Mute microphone' : 'Unmute microphone'}
                    >
                      {isListening ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCaptureNow}
                      disabled={isAnalyzingFrame || !isVideoReady}
                      title="Capture and analyze now"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-primary font-medium">Processing...</span>
              </div>
            )}
          </Card>

          {/* Session Controls */}
          <div className="flex justify-center gap-4">
            {!isSessionActive ? (
              <Button
                size="lg"
                onClick={handleStartSession}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                disabled={!isVoiceSupported || isStarting}
              >
                {isStarting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Start Consultation
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleEndSession}
                className="gap-2"
              >
                <PhoneOff className="w-5 h-5" />
                End Session
              </Button>
            )}
          </div>

          {!isVoiceSupported && (
            <p className="text-center text-destructive text-sm">
              Voice recognition not supported in this browser. Please use Chrome or Edge.
            </p>
          )}

          {/* Live Transcript */}
          {isSessionActive && (
            <LiveTranscript
              messages={session?.messages || []}
              currentTranscript={transcript}
            />
          )}

          {/* Triage Status & Extracted Info */}
          {isSessionActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TriageIndicator level={currentTriage?.triageLevel || null} />

              {currentTriage?.extractedInfo &&
                Object.keys(currentTriage.extractedInfo).length > 0 && (
                  <Card className="p-4 bg-card/50 border-border/30">
                    <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                      Extracted Information
                    </h3>
                    <ul className="text-sm space-y-1">
                      {currentTriage.extractedInfo.symptoms?.map((s, i) => (
                        <li key={i} className="text-foreground">
                          • {s}
                        </li>
                      ))}
                      {currentTriage.extractedInfo.bodyPart && (
                        <li className="text-foreground">
                          📍 Location: {currentTriage.extractedInfo.bodyPart}
                        </li>
                      )}
                      {currentTriage.extractedInfo.duration && (
                        <li className="text-foreground">
                          ⏱️ Duration: {currentTriage.extractedInfo.duration}
                        </li>
                      )}
                      {currentTriage.extractedInfo.severity && (
                        <li className="text-foreground">
                          📊 Severity: {currentTriage.extractedInfo.severity}
                        </li>
                      )}
                      {currentTriage.extractedInfo.redFlags && 
                        currentTriage.extractedInfo.redFlags.length > 0 && (
                        <li className="text-destructive font-medium">
                          ⚠️ Red Flags: {currentTriage.extractedInfo.redFlags.join(', ')}
                        </li>
                      )}
                    </ul>
                  </Card>
                )}
            </div>
          )}

          {/* Vision Analysis Summary */}
          {isSessionActive && latestVision && latestVision.overallAssessment && (
            <Card className="p-4 bg-card/50 border-border/30">
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                Visual Analysis
              </h3>
              <p className="text-sm text-foreground mb-2">
                {latestVision.overallAssessment}
              </p>
              {latestVision.recommendations && latestVision.recommendations.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {latestVision.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* Session Complete */}
          {session?.endTime && (
            <Card className="p-6 bg-card/50 border-primary/20 text-center space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Consultation Complete
              </h2>
              <TriageIndicator
                level={currentTriage?.triageLevel || null}
                className="justify-center"
              />
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/assessment')} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Get Full Report
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsSessionActive(false);
                  window.location.reload();
                }}>
                  New Consultation
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ This AI consultation is not a substitute for professional medical
                advice.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Live;
