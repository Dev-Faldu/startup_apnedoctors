import { Camera, MessageCircle, Scan, ClipboardList } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Start Camera",
    description: "Open the app and point your camera at the affected area. Our AI begins analysis instantly.",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Describe Symptoms",
    description: "Answer guided questions about pain level, duration, and other symptoms for comprehensive evaluation.",
  },
  {
    step: "03",
    icon: Scan,
    title: "AI Visual Examination",
    description: "Advanced computer vision detects visible injury markers like swelling, redness, and bruising.",
  },
  {
    step: "04",
    icon: ClipboardList,
    title: "Clinical Triage",
    description: "Receive evidence-based recommendations and next steps for your care pathway.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-card/30" />
      <div className="absolute inset-0 neural-lines opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-6">
            <span className="text-sm text-primary font-medium">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            How It{" "}
            <span className="gradient-text text-glow">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to get hospital-level preliminary assessment from your smartphone.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden lg:block" />

            {/* Steps Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <StepCard key={step.step} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-2">Ready to try?</p>
          <p className="text-lg text-foreground font-medium">
            No registration required • Free evaluation • Real-time results
          </p>
        </div>
      </div>
    </section>
  );
};

const StepCard = ({ step, index }: { step: typeof steps[0]; index: number }) => {
  const Icon = step.icon;
  
  return (
    <div 
      className="relative group"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Card */}
      <div className="glass-card p-6 rounded-2xl hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 h-full">
        {/* Step Number */}
        <div className="text-5xl font-bold text-primary/20 mb-4 group-hover:text-primary/40 transition-colors">
          {step.step}
        </div>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Arrow (hidden on last item and on mobile) */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-10">
          <svg viewBox="0 0 24 24" className="w-full h-full text-primary/30">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default HowItWorksSection;
