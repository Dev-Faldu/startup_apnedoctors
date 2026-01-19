import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, ChevronRight, RotateCcw, Eye } from 'lucide-react';
import { TriageResult } from '@/types/assessment';
import { ClinicalTriageOutput } from '@/types/clinical-assessment';

interface CameraCaptureProps {
  onSubmit: (imageBase64: string | null, bodyPart?: string) => void;
  isLoading: boolean;
  bodyPart: string;
  triageResult: TriageResult | ClinicalTriageOutput | null;
}

export function CameraCapture({ onSubmit, isLoading, bodyPart, triageResult }: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setIsCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const clearImage = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const handleSubmit = () => {
    onSubmit(capturedImage, bodyPart);
  };

  const handleSkip = () => {
    onSubmit(null, bodyPart);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Step 2 of 4</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Visual Injury Scan
        </h2>
        <p className="text-muted-foreground">
          Capture or upload an image of your {bodyPart.toLowerCase()} for AI analysis
        </p>
      </div>

      {/* Triage Summary */}
      {triageResult && (
        <div className="holographic-card p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Preliminary Triage Level</span>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              triageResult.triageLevel <= 2 ? 'bg-red-500/20 text-red-400' :
              triageResult.triageLevel <= 3 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              Level {triageResult.triageLevel}/5
            </div>
          </div>
          {triageResult.shouldSeekEmergencyCare && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 font-medium">
                ⚠️ Consider seeking emergency care
              </p>
            </div>
          )}
        </div>
      )}

      {/* Camera/Image Display */}
      <div className="holographic-card rounded-xl overflow-hidden mb-6">
        <div className="aspect-video bg-navy-900 relative">
          {isCapturing ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* AI Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/50">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    AI Camera Active
                  </span>
                </div>
                {/* Scanning grid overlay */}
                <div className="absolute inset-8 border-2 border-primary/30 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                </div>
              </div>
            </>
          ) : capturedImage ? (
            <>
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              {/* AI Detection overlay simulation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/50">
                  <span className="text-xs text-green-400 font-medium">✓ Image Captured</span>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              <p className="text-sm">No image captured yet</p>
              <p className="text-xs mt-1">Use the camera or upload an image</p>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <div className="p-4 bg-navy-800/50">
          {isCapturing ? (
            <div className="flex gap-3">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={capturePhoto} variant="hero" className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>
          ) : capturedImage ? (
            <div className="flex gap-3">
              <Button onClick={clearImage} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button onClick={startCamera} variant="outline" className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Open Camera
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="hero"
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Analyzing Image...
            </>
          ) : (
            <>
              {capturedImage ? 'Analyze Image' : 'Continue Without Image'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        
        {capturedImage && (
          <Button
            onClick={handleSkip}
            disabled={isLoading}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Skip visual analysis
          </Button>
        )}
      </div>
    </div>
  );
}
