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
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Camera,
  FileText,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const Live = () => {
  const navigate = useNavigate();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAnalyzingFrame, setIsAnalyzingFrame] = useState(false);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    videoRef,
    canvasRef,
    isActive: isCameraActive,
    isVideoReady,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame,
  } = useLiveCamera();

  const {
    session,
    dbSessionId,
    isProcessing,
    currentTriage,
    latestVision,
    startSession,
    endSession,
    processVoiceInput,
    analyzeFrame,
  } = useLiveSession();

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  const handleSilence = useCallback(async () => {
    if (transcript && !isProcessing) {
      const result = await processVoiceInput(transcript);
      resetTranscript();
      
      if (result?.response) {
        speak(result.response);
      }
    }
  }, [processVoiceInput, speak]);

  const {
    isListening,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    onSilence: handleSilence,
    silenceTimeout: 2000,
  });

  const handleStartSession = async () => {
    await startCamera();
    const sessionId = await startSession();
    if (!sessionId) {
      stopCamera();
      return;
    }
    startListening();
    setIsSessionActive(true);
  };

  // Start frame analysis only when video is ready
  useEffect(() => {
    if (isSessionActive && isVideoReady) {
      console.log('Video ready, starting frame analysis interval');
      frameIntervalRef.current = setInterval(async () => {
        const frame = captureFrame();
        if (frame) {
          setIsAnalyzingFrame(true);
          await analyzeFrame(frame);
          setIsAnalyzingFrame(false);
        }
      }, 5000);
    }

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [isSessionActive, isVideoReady, captureFrame, analyzeFrame]);

  const handleEndSession = () => {
    stopListening();
    stopCamera();
    stopSpeaking();
    endSession();
    setIsSessionActive(false);

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
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
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              <span className="text-primary">AI</span> Medical Consultation
            </h1>
            <p className="text-muted-foreground">
              {isSessionActive
                ? 'AI Doctor is listening. Describe your symptoms or show your injury.'
                : 'Start a live consultation with our AI medical assistant'}
            </p>
          </div>

          {/* Main Video Area */}
          <Card className="relative aspect-video bg-card/50 border-primary/20 overflow-hidden">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p>Initializing camera...</p>
                  </div>
                )}
                <VisionOverlay
                  detections={latestVision?.detections || []}
                  concernLevel={latestVision?.concernLevel || 'low'}
                  isAnalyzing={isAnalyzingFrame}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <Video className="w-16 h-16 mb-4 opacity-50" />
                <p>Camera will activate when session starts</p>
                {cameraError && (
                  <p className="text-destructive text-sm mt-2">{cameraError}</p>
                )}
              </div>
            )}

            {/* Voice Activity */}
            {isSessionActive && (
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
                      disabled={isAnalyzingFrame}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
                disabled={!isVoiceSupported}
              >
                <Phone className="w-5 h-5" />
                Start Consultation
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

          {/* Triage Status */}
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
                          Location: {currentTriage.extractedInfo.bodyPart}
                        </li>
                      )}
                      {currentTriage.extractedInfo.duration && (
                        <li className="text-foreground">
                          Duration: {currentTriage.extractedInfo.duration}
                        </li>
                      )}
                    </ul>
                  </Card>
                )}
            </div>
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
                <Button variant="outline" onClick={() => setIsSessionActive(false)}>
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
