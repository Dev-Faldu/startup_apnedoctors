import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useVoiceBackendSettings } from "@/hooks/useVoiceBackendSettings";
import { 
  ArrowLeft, 
  Server, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  Zap,
  Activity,
  Clock,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { settings, isLoading, saveSettings, testConnection, resetSettings } = useVoiceBackendSettings();
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  // Sync local state when settings load
  useEffect(() => {
    if (!isLoading) {
      setBackendUrl(settings.backendUrl);
    }
  }, [isLoading, settings.backendUrl]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const result = await testConnection(backendUrl);
    setTestResult(result);
    
    if (result.success) {
      toast.success("Connection successful!", {
        description: result.message,
      });
    } else {
      toast.error("Connection failed", {
        description: result.message,
      });
    }
    
    setIsTesting(false);
  };

  const handleSave = () => {
    saveSettings({ backendUrl });
    toast.success("Settings saved");
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    // If enabling and we don't have a known successful test, try testing now.
    if (enabled && !settings.lastTestSuccess) {
      setIsTesting(true);
      setTestResult(null);

      const result = await testConnection(backendUrl);
      setTestResult(result);
      setIsTesting(false);

      if (!result.success) {
        toast.error("Please test the connection first", {
          description: "The backend must be reachable before enabling.",
        });
        return;
      }
    }

    saveSettings({ enabled });
    toast.success(enabled ? "Self-hosted backend enabled" : "Self-hosted backend disabled");
  };

  const handleReset = () => {
    resetSettings();
    setBackendUrl('');
    setTestResult(null);
    toast.success("Settings reset to defaults");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Voice Backend Configuration */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Self-Hosted Voice Backend</CardTitle>
                <CardDescription>
                  Connect to your own GPU-powered voice AI server
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="space-y-0.5">
                <Label htmlFor="enable-backend" className="text-base font-medium">
                  Enable Self-Hosted Backend
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use your own voice AI server instead of built-in AI
                </p>
              </div>
              <Switch
                id="enable-backend"
                checked={settings.enabled}
                onCheckedChange={handleToggleEnabled}
                disabled={isTesting}
              />
            </div>

            <Separator className="bg-border/50" />

            {/* Backend URL */}
            <div className="space-y-3">
              <Label htmlFor="backend-url" className="text-sm font-medium">
                Backend URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="backend-url"
                  placeholder="https://your-gpu-server.com:8000"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="flex-1 bg-background/50"
                />
                <Button 
                  variant="outline" 
                  onClick={handleSave}
                  disabled={backendUrl === settings.backendUrl}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the full URL to your self-hosted voice AI orchestrator
              </p>
            </div>

            {/* Test Connection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleTestConnection}
                  disabled={isTesting || !backendUrl.trim()}
                  className="gap-2"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    testResult.success
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <p className="font-medium">
                      {testResult.success ? "Connection Successful" : "Connection Failed"}
                    </p>
                    <p className="text-sm opacity-80">{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-border/50" />

            {/* Connection Status */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Connection Status</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    Last Tested
                  </div>
                  <p className="font-medium text-sm">
                    {settings.lastTested
                      ? new Date(settings.lastTested).toLocaleString()
                      : "Never tested"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Activity className="h-4 w-4" />
                    Status
                  </div>
                  {settings.lastTestSuccess === null ? (
                    <Badge variant="secondary" className="text-xs">Unknown</Badge>
                  ) : settings.lastTestSuccess ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Failed</Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Reset */}
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Reset Settings</p>
                <p className="text-xs text-muted-foreground">
                  Clear all voice backend configuration
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Self-Hosted Backend Requirements</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• GPU server with NVIDIA CUDA support</li>
                  <li>• Docker and Docker Compose installed</li>
                  <li>• At least 16GB GPU VRAM recommended</li>
                  <li>• Backend must expose <code className="text-xs bg-muted px-1 py-0.5 rounded">/health</code> endpoint</li>
                </ul>
                <Link to="/docs/self-hosted-backend" className="text-primary text-sm hover:underline">
                  View deployment documentation →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
