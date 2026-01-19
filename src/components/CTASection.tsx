import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, Shield, Zap } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-background to-background" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Glow Effects */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/20 blur-[150px] rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main CTA Card */}
          <div className="glass-card neon-border p-8 md:p-12 rounded-3xl holographic">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-8 shadow-glow">
              <Scan className="w-10 h-10 text-primary animate-pulse-glow" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Start Your AI{" "}
              <span className="gradient-text text-glow">Injury Scan</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Get instant preliminary medical assessment using cutting-edge AI. 
              No registration required.
            </p>

            {/* CTA Button */}
            <Button 
              variant="hero" 
              size="xl" 
              className="group mb-8"
              onClick={() => navigate('/clinical-assessment')}
            >
              Start AI Injury Scan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                No registration required
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Real-time analysis
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Free evaluation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
