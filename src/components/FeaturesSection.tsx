import { useNavigate } from "react-router-dom";
import { Eye, Brain, Move, ShieldCheck, Stethoscope, Scan, FileText, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Eye,
    title: "Visual Injury Detection",
    description: "Detects swelling, redness, bruising, and visible trauma using computer vision.",
    gradient: "from-cyan-glow/20 to-blue-electric/10",
    route: "/clinical-assessment",
    cta: "Start Scan",
  },
  {
    icon: Brain,
    title: "AI Medical Assistant",
    description: "Intelligent symptom analysis powered by advanced medical LLMs.",
    gradient: "from-secondary/20 to-cyan-glow/10",
    route: "/clinical-assessment",
    cta: "Try AI",
  },
  {
    icon: Video,
    title: "Live AI Consultation",
    description: "Real-time voice and video medical assessment with instant AI feedback.",
    gradient: "from-purple-accent/20 to-secondary/10",
    route: "/live",
    cta: "Go Live",
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    description: "Upload medical reports and get instant AI-powered clinical summaries.",
    gradient: "from-green-500/20 to-cyan-glow/10",
    route: "/document-analysis",
    cta: "Analyze Doc",
  },
  {
    icon: Stethoscope,
    title: "Doctor Verified Triage",
    description: "All AI recommendations validated against clinical guidelines.",
    gradient: "from-cyan-glow/20 to-purple-accent/10",
    route: "/clinical-assessment",
    cta: "Get Triage",
  },
  {
    icon: Scan,
    title: "Real-Time Scanning",
    description: "Instant analysis with live camera feed and immediate feedback.",
    gradient: "from-secondary/20 to-purple-accent/10",
    route: "/live",
    cta: "Start Camera",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="absolute inset-0 neural-lines opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-6">
            <span className="text-sm text-primary font-medium">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Real-Time AI Healthcare,{" "}
            <span className="gradient-text text-glow">In Your Pocket</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Advanced multimodal AI technology that brings hospital-level diagnostics to your smartphone.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const Icon = feature.icon;
  const navigate = useNavigate();
  
  return (
    <div 
      className="group relative glass-card p-6 rounded-2xl hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        {/* Text */}
        <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {feature.description}
        </p>

        {/* CTA Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-primary hover:text-primary hover:bg-primary/10 p-0 h-auto"
          onClick={() => navigate(feature.route)}
        >
          {feature.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Neural Network Decorative Lines */}
        <div className="absolute top-4 right-4 w-16 h-16 opacity-20 group-hover:opacity-40 transition-opacity">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <circle cx="8" cy="8" r="2" fill="currentColor" className="text-primary" />
            <circle cx="32" cy="16" r="2" fill="currentColor" className="text-primary" />
            <circle cx="56" cy="8" r="2" fill="currentColor" className="text-primary" />
            <circle cx="16" cy="40" r="2" fill="currentColor" className="text-primary" />
            <circle cx="48" cy="48" r="2" fill="currentColor" className="text-primary" />
            <line x1="8" y1="8" x2="32" y2="16" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            <line x1="32" y1="16" x2="56" y2="8" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            <line x1="32" y1="16" x2="16" y2="40" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            <line x1="16" y1="40" x2="48" y2="48" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
