import { Eye, MessageSquare, GitBranch, FileText } from "lucide-react";

const layers = [
  {
    icon: Eye,
    title: "Computer Vision",
    subtitle: "YOLO + MediaPipe",
    description: "Real-time injury detection and pose estimation",
    color: "cyan-glow",
  },
  {
    icon: MessageSquare,
    title: "Symptom Understanding",
    subtitle: "Medical LLM",
    description: "Natural language processing for symptom analysis",
    color: "secondary",
  },
  {
    icon: GitBranch,
    title: "Clinical Triage Logic",
    subtitle: "Decision Engine",
    description: "Evidence-based clinical decision support",
    color: "purple-accent",
  },
  {
    icon: FileText,
    title: "Structured Reports",
    subtitle: "Health Documentation",
    description: "Comprehensive medical assessment outputs",
    color: "green-500",
  },
];

const TechnologySection = () => {
  return (
    <section id="technology" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-card/30" />
      
      {/* Animated Background Orbs */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] animate-pulse-glow delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-6">
            <span className="text-sm text-primary font-medium">Multimodal AI System</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Layered Intelligence{" "}
            <span className="gradient-text text-glow">Architecture</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Four interconnected AI layers working together to provide comprehensive medical assessment.
          </p>
        </div>

        {/* Stacked Layers Visualization */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {layers.map((layer, index) => (
              <LayerCard key={layer.title} layer={layer} index={index} total={layers.length} />
            ))}

            {/* Connecting Lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-1/2 hidden lg:block" />
          </div>
        </div>

        {/* Bottom Visual */}
        <div className="mt-16 flex justify-center">
          <div className="glass-card neon-border p-6 rounded-2xl max-w-md text-center">
            <div className="flex justify-center gap-4 mb-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              All layers process simultaneously for real-time clinical insights
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const LayerCard = ({ layer, index, total }: { layer: typeof layers[0]; index: number; total: number }) => {
  const Icon = layer.icon;
  const isEven = index % 2 === 0;
  
  return (
    <div 
      className={`relative flex items-center gap-8 mb-8 last:mb-0 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Layer Number */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="text-8xl font-bold text-primary/10">
          0{index + 1}
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 glass-card p-6 rounded-2xl hover:border-primary/50 transition-all duration-500 group hover:-translate-y-1">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-${layer.color}/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 text-primary`} />
          </div>
          
          {/* Text */}
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">{layer.subtitle}</div>
            <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
              {layer.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {layer.description}
            </p>
          </div>

          {/* Layer Badge */}
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-primary/30 text-primary text-sm font-semibold">
            L{index + 1}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TechnologySection;
