const VisionSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] animate-pulse-glow delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Vision Statement */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            <span className="text-muted-foreground">We are building the</span>
            <br />
            <span className="gradient-text text-glow">future of remote medicine</span>
            <br />
            <span className="text-foreground">where hospital-level evaluation</span>
            <br />
            <span className="text-foreground">begins with</span>{" "}
            <span className="text-primary text-glow">your phone</span>
          </h2>

          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-primary/50" />
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16">
            <VisionStat value="24/7" label="AI Availability" />
            <VisionStat value="<30s" label="Assessment Time" />
            <VisionStat value="∞" label="Accessibility" />
          </div>
        </div>
      </div>
    </section>
  );
};

const VisionStat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default VisionSection;
