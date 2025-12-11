import { useState, useEffect, useRef, useCallback } from 'react';

export const useLiveCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setIsVideoReady(false);
      
      // Try environment camera first, fallback to user-facing
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', 
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          },
          audio: true,
        });
      } catch {
        // Fallback to any available camera
        console.log('Falling back to default camera');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playing, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
                setIsVideoReady(true);
              })
              .catch(err => {
                console.error('Video play error:', err);
              });
          }
        };

        videoRef.current.oncanplay = () => {
          console.log('Video can play');
        };
      }
      
      setIsActive(true);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant permission and ensure camera is not in use by another app.');
      setIsActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsVideoReady(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('Missing video or canvas ref');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Could not get canvas context');
      return null;
    }

    // Check video readiness
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video dimensions not ready:', video.videoWidth, 'x', video.videoHeight);
      return null;
    }

    if (video.readyState < 2) {
      console.log('Video readyState too low:', video.readyState);
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    if (dataUrl.length < 1000) {
      console.log('Captured frame too small:', dataUrl.length);
      return null;
    }

    console.log('Frame captured successfully, size:', dataUrl.length);
    return dataUrl;
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    isVideoReady,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
};
