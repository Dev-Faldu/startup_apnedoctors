import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Building2, Brain, Play } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Radial Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-[100px] animate-pulse-glow delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 animate-fade-in-up">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">AI-Powered Healthcare Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-fade-in-up delay-100">
              Your{" "}
              <span className="gradient-text text-glow">AI-Powered</span>
              <br />
              Personal Medical
              <br />
              Assessment.{" "}
              <span className="text-primary text-glow">Anywhere.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
              Instant orthopedic evaluation using multimodal AI, injury vision analysis, 
              clinical triage, and medical reasoning.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => navigate('/assessment')}
              >
                Start Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="heroOutline" 
                size="xl" 
                className="group"
                onClick={() => navigate('/live')}
              >
                <Play className="w-5 h-5" />
                Try Live AI
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4 animate-fade-in-up delay-400">
              <TrustBadge icon={<Shield className="w-4 h-4" />} text="Backed by Doctors" />
              <TrustBadge icon={<Building2 className="w-4 h-4" />} text="Deployed at Hospitals" />
              <TrustBadge icon={<Brain className="w-4 h-4" />} text="Responsible AI Verified" />
            </div>
          </div>

          {/* Right Content - Holographic Display */}
          <div className="relative animate-fade-in-up delay-200">
            <HolographicDisplay />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

const TrustBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <div className="text-primary">{icon}</div>
    <span>{text}</span>
  </div>
);

const HolographicDisplay = () => (
  <div className="relative">
    {/* Main Display Frame */}
    <div className="relative glass-card neon-border p-6 rounded-3xl holographic">
      {/* Skeleton Visualization */}
      <div className="relative aspect-[4/5] flex items-center justify-center">
        {/* Grid Overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30 rounded-2xl" />
        
        {/* Skeleton SVG */}
        <svg viewBox="0 0 200 300" className="w-full h-full max-w-[280px] animate-float">
          {/* Body Outline */}
          <g stroke="hsl(var(--cyan-glow))" strokeWidth="1" fill="none" opacity="0.8">
            {/* Head */}
            <circle cx="100" cy="35" r="20" className="animate-pulse-glow" />
            
            {/* Spine */}
            <line x1="100" y1="55" x2="100" y2="150" />
            
            {/* Ribs */}
            <path d="M70 80 Q100 90 130 80" />
            <path d="M75 95 Q100 105 125 95" />
            <path d="M80 110 Q100 118 120 110" />
            
            {/* Shoulders */}
            <line x1="100" y1="65" x2="55" y2="75" />
            <line x1="100" y1="65" x2="145" y2="75" />
            
            {/* Arms */}
            <line x1="55" y1="75" x2="35" y2="130" />
            <line x1="35" y1="130" x2="25" y2="180" />
            <line x1="145" y1="75" x2="165" y2="130" />
            <line x1="165" y1="130" x2="175" y2="180" />
            
            {/* Pelvis */}
            <ellipse cx="100" cy="160" rx="35" ry="15" />
            
            {/* Legs */}
            <line x1="80" y1="170" x2="70" y2="240" />
            <line x1="70" y1="240" x2="65" y2="290" />
            <line x1="120" y1="170" x2="130" y2="240" />
            <line x1="130" y1="240" x2="135" y2="290" />
          </g>
          
          {/* Injury Detection Hotspot - Knee */}
          <g className="animate-pulse">
            <circle cx="130" cy="240" r="15" fill="hsl(var(--destructive) / 0.3)" stroke="hsl(var(--destructive))" strokeWidth="2" />
            <circle cx="130" cy="240" r="8" fill="hsl(var(--destructive) / 0.5)" />
          </g>
          
          {/* AI Detection Box */}
          <g stroke="hsl(var(--cyan-glow))" strokeWidth="1.5" fill="none" strokeDasharray="4 2">
            <rect x="110" y="220" width="40" height="40" rx="4" className="animate-pulse-glow" />
          </g>
        </svg>

        {/* Floating Labels */}
        <div className="absolute top-1/4 right-0 translate-x-4">
          <FloatingLabel text="Spine Analysis" status="Normal" />
        </div>
        
        <div className="absolute bottom-1/3 right-0 translate-x-8">
          <FloatingLabel text="Knee Detection" status="Inflammation" isWarning />
        </div>
        
        <div className="absolute top-1/2 left-0 -translate-x-4">
          <FloatingLabel text="Posture Check" status="Aligned" />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            AI Active
          </span>
          <span>Processing: Real-time</span>
          <span className="text-primary">98.7% Confidence</span>
        </div>
      </div>
    </div>

    {/* Decorative Elements */}
    <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
    <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
    <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
    <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />

    {/* Glow Effect */}
    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
  </div>
);

const FloatingLabel = ({ text, status, isWarning = false }: { text: string; status: string; isWarning?: boolean }) => (
  <div className="glass-card px-3 py-2 rounded-lg text-xs whitespace-nowrap animate-float-slow">
    <div className="text-muted-foreground">{text}</div>
    <div className={`font-semibold ${isWarning ? 'text-destructive' : 'text-primary'}`}>{status}</div>
  </div>
);

export default HeroSection;
