import { useState, useEffect, useRef, useCallback } from 'react';

export const useLiveCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      setIsVideoReady(false);
      
      console.log('Requesting camera access...');
      
      // Try environment camera first (for mobile back camera), fallback to user-facing
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', 
            width: { ideal: 1280, min: 640 }, 
            height: { ideal: 720, min: 480 } 
          },
          audio: false, // We handle audio separately via voice recognition
        });
        console.log('Got environment camera');
      } catch (envError) {
        console.log('Environment camera failed, trying any camera:', envError);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'user',
              width: { ideal: 1280 }, 
              height: { ideal: 720 } 
            },
            audio: false,
          });
          console.log('Got user-facing camera');
        } catch (userError) {
          console.log('User camera failed, trying basic video:', userError);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          console.log('Got basic video stream');
        }
      }
      
      streamRef.current = stream;
      
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('Video track settings:', settings);
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        const video = videoRef.current;
        
        // Promise-based approach with timeout fallback
        const waitForVideoReady = new Promise<void>((resolve) => {
          let resolved = false;
          
          const markReady = () => {
            if (!resolved) {
              resolved = true;
              console.log('Video marked as ready');
              setIsVideoReady(true);
              resolve();
            }
          };

          video.onloadedmetadata = () => {
            console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              markReady();
            }
          };
          
          video.oncanplay = () => {
            console.log('Video can play');
            markReady();
          };

          video.onplaying = () => {
            console.log('Video is now playing');
            markReady();
          };

          video.onerror = (e) => {
            console.error('Video error:', e);
            setError('Video playback error');
          };

          // Fallback: poll for readiness every 100ms for up to 3s
          let pollCount = 0;
          const pollInterval = setInterval(() => {
            pollCount++;
            if (video.readyState >= 2 && video.videoWidth > 0) {
              console.log('Video ready via polling, readyState:', video.readyState);
              clearInterval(pollInterval);
              markReady();
            } else if (pollCount > 30) {
              clearInterval(pollInterval);
              console.log('Video polling timeout, forcing ready');
              markReady(); // Force ready after 3s
            }
          }, 100);
        });

        // Try to play
        try {
          await video.play();
          console.log('Video play() resolved');
        } catch (playError) {
          console.warn('Video autoplay failed, user interaction may be needed:', playError);
        }

        // Wait for video to be ready (with timeout)
        await waitForVideoReady;
      }
      
      setIsActive(true);
      console.log('Camera started successfully');
      
    } catch (err: any) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is in use by another application. Please close other apps using the camera.');
      } else {
        setError(`Camera error: ${err.message || 'Unknown error'}`);
      }
      
      setIsActive(false);
      setIsVideoReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.oncanplay = null;
      videoRef.current.onplaying = null;
      videoRef.current.onerror = null;
    }
    
    setIsActive(false);
    setIsVideoReady(false);
    setError(null);
    
    console.log('Camera stopped');
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('Missing refs - video:', !!videoRef.current, 'canvas:', !!canvasRef.current);
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.log('Could not get canvas 2d context');
      return null;
    }

    // Check video readiness
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video dimensions not ready:', video.videoWidth, 'x', video.videoHeight);
      return null;
    }

    if (video.readyState < 2) {
      console.log('Video readyState too low:', video.readyState, '(need >= 2)');
      return null;
    }

    // Check if video is actually playing
    if (video.paused || video.ended) {
      console.log('Video not playing - paused:', video.paused, 'ended:', video.ended);
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    try {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Slightly lower quality for faster processing
      
      if (dataUrl.length < 1000 || dataUrl === 'data:,') {
        console.log('Captured frame too small or empty:', dataUrl.length);
        return null;
      }

      console.log('Frame captured:', Math.round(dataUrl.length / 1024), 'KB');
      return dataUrl;
    } catch (drawError) {
      console.error('Error drawing video to canvas:', drawError);
      return null;
    }
  }, []);

  const retryCamera = useCallback(async () => {
    stopCamera();
    await new Promise(resolve => setTimeout(resolve, 500));
    await startCamera();
  }, [stopCamera, startCamera]);

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
    permissionDenied,
    startCamera,
    stopCamera,
    captureFrame,
    retryCamera,
  };
};
