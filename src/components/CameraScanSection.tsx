import { Smartphone, Zap, AlertTriangle } from "lucide-react";

const CameraScanSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-card/30" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Phone Mockup */}
          <div className="flex justify-center lg:justify-end order-2 lg:order-1">
            <PhoneMockup />
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Live AI Scanning</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Real-Time{" "}
              <span className="gradient-text text-glow">Injury Detection</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Point your camera at the affected area and let our AI analyze visible symptoms in real-time. 
              From swelling detection to redness heat-mapping.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              <FeatureItem 
                icon={<div className="w-2 h-2 bg-primary rounded-full" />}
                title="Bounding Box Detection"
                description="AI identifies and tracks injury regions automatically"
              />
              <FeatureItem 
                icon={<div className="w-2 h-2 bg-destructive rounded-full" />}
                title="Heat Map Visualization"
                description="Visual overlay showing inflammation intensity"
              />
              <FeatureItem 
                icon={<div className="w-2 h-2 bg-green-500 rounded-full" />}
                title="Conversational Diagnosis"
                description="AI asks follow-up questions for accurate assessment"
              />
            </div>

            {/* Disclaimer */}
            <div className="glass-card p-4 rounded-xl border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  AI assessment is for preliminary evaluation only. Always consult a healthcare professional for diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start gap-4">
    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const PhoneMockup = () => (
  <div className="relative">
    {/* Phone Frame */}
    <div className="relative w-72 sm:w-80 mx-auto">
      {/* Phone Border */}
      <div className="glass-card neon-border rounded-[3rem] p-3 bg-background/80">
        {/* Screen */}
        <div className="relative rounded-[2.25rem] overflow-hidden bg-card aspect-[9/19]">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-background/50 backdrop-blur flex items-center justify-center z-10">
            <div className="w-20 h-5 bg-foreground/10 rounded-full" />
          </div>

          {/* Camera View */}
          <div className="absolute inset-0 pt-8 flex items-center justify-center bg-gradient-to-br from-muted/50 to-background">
            {/* Grid Overlay */}
            <div className="absolute inset-0 grid-pattern opacity-20" />
            
            {/* Knee Visualization */}
            <div className="relative w-48 h-48">
              {/* Knee Shape */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Knee Outline */}
                <ellipse cx="100" cy="100" rx="60" ry="70" fill="hsl(var(--muted))" stroke="hsl(var(--cyan-glow))" strokeWidth="1" opacity="0.5" />
                <ellipse cx="100" cy="90" rx="45" ry="50" fill="hsl(var(--muted-foreground) / 0.2)" />
              </svg>

              {/* Heat Map Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-radial from-destructive/60 via-orange-500/30 to-transparent animate-pulse" />
              </div>

              {/* AI Bounding Box */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32">
                <div className="w-full h-full border-2 border-primary rounded-lg animate-pulse-glow">
                  {/* Corner Markers */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                </div>
              </div>

              {/* Label */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 glass-card px-3 py-1 rounded-full text-xs">
                <span className="text-primary font-semibold">KNEE</span>
                <span className="text-muted-foreground ml-2">94.2%</span>
              </div>
            </div>
          </div>

          {/* Bottom UI */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gradient-to-t from-background to-transparent">
            {/* Detection Alert */}
            <div className="glass-card p-3 rounded-xl border-destructive/50 bg-destructive/10">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
                <AlertTriangle className="w-4 h-4" />
                Possible inflammation detected
              </div>
              <p className="text-xs text-muted-foreground">
                Visible swelling in right knee area
              </p>
            </div>

            {/* AI Question */}
            <div className="glass-card p-3 rounded-xl">
              <p className="text-sm text-foreground mb-2">
                Would you describe the pain as:
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 rounded-lg bg-primary/20 text-primary text-xs font-medium border border-primary/30 hover:bg-primary/30 transition-colors">
                  Sharp
                </button>
                <button className="flex-1 py-2 px-3 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
                  Dull
                </button>
              </div>
            </div>
          </div>

          {/* Scan Line Animation */}
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
    </div>

    {/* Glow Effects */}
    <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full -z-10" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-destructive/20 blur-[80px] rounded-full -z-10" />
  </div>
);

export default CameraScanSection;
