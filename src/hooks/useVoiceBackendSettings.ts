import { useState, useEffect, useCallback } from 'react';

export interface VoiceBackendSettings {
  backendUrl: string;
  enabled: boolean;
  lastTested: string | null;
  lastTestSuccess: boolean | null;
}

const STORAGE_KEY = 'apnedoctors_voice_backend_settings';

const defaultSettings: VoiceBackendSettings = {
  backendUrl: '',
  enabled: false,
  lastTested: null,
  lastTestSuccess: null,
};

export const useVoiceBackendSettings = () => {
  const [settings, setSettings] = useState<VoiceBackendSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load voice backend settings:', error);
    }
    setIsLoading(false);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<VoiceBackendSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save voice backend settings:', error);
      }
      return updated;
    });
  }, []);

  // Test connection to backend
  const testConnection = useCallback(async (url: string): Promise<{ success: boolean; message: string; latency?: number }> => {
    if (!url.trim()) {
      return { success: false, message: 'Please enter a backend URL' };
    }

    const startTime = Date.now();
    
    try {
      const cleanUrl = url.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        saveSettings({
          lastTested: new Date().toISOString(),
          lastTestSuccess: true,
        });
        return { 
          success: true, 
          message: `Connected successfully (${latency}ms latency)`,
          latency 
        };
      } else {
        saveSettings({
          lastTested: new Date().toISOString(),
          lastTestSuccess: false,
        });
        return { 
          success: false, 
          message: `Server returned ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      saveSettings({
        lastTested: new Date().toISOString(),
        lastTestSuccess: false,
      });
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          return { success: false, message: 'Connection timed out after 10 seconds' };
        }
        return { success: false, message: `Connection failed: ${error.message}` };
      }
      return { success: false, message: 'Connection failed: Unknown error' };
    }
  }, [saveSettings]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset voice backend settings:', error);
    }
  }, []);

  return {
    settings,
    isLoading,
    saveSettings,
    testConnection,
    resetSettings,
  };
};
