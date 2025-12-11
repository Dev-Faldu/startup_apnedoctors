import { Building2, Stethoscope, ShieldCheck, Award } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const badges = [
  {
    icon: Stethoscope,
    title: "Orthopedic Supervision",
    description: "Built under guidance of certified orthopedic specialists",
  },
  {
    icon: Building2,
    title: "Hospital Tested",
    description: "Validated in real clinical environments",
  },
  {
    icon: ShieldCheck,
    title: "Patient-Safe AI",
    description: "Safety-first design with clear limitations",
  },
];

const DoctorVerifiedSection = () => {
  const { stats, isLoading } = usePlatformStats();

  return (
    <section id="about" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-6">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Medical Credibility</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Developed with{" "}
              <span className="gradient-text text-glow">Real Doctors</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI system is built in collaboration with healthcare professionals, ensuring clinical accuracy and patient safety.
            </p>
          </div>

          {/* Badges Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {badges.map((badge, index) => (
              <BadgeCard key={badge.title} badge={badge} index={index} />
            ))}
          </div>

          {/* Hospital Deployment Card */}
          <div className="glass-card neon-border p-8 rounded-3xl text-center holographic">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Live Deployment</h3>
            </div>
            
            <div className="max-w-xl mx-auto">
              <p className="text-xl text-primary font-semibold mb-2">
                Arpan Hospital, Rajkot
              </p>
              <p className="text-muted-foreground">
                Currently deployed in a real medical setting for live evaluation and continuous improvement.
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <StatusIndicator 
                label="Active Status" 
                value={stats.isOperational ? "Operational" : "Offline"} 
                isActive={stats.isOperational} 
              />
              <StatusIndicator 
                label="Patients Screened" 
                value={isLoading ? "..." : `${stats.patientsScreened}+`} 
              />
              <StatusIndicator 
                label="Accuracy Rate" 
                value={isLoading ? "..." : `${stats.accuracyRate}%`} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BadgeCard = ({ badge, index }: { badge: typeof badges[0]; index: number }) => {
  const Icon = badge.icon;
  
  return (
    <div 
      className="glass-card p-6 rounded-2xl text-center hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{badge.title}</h3>
      <p className="text-sm text-muted-foreground">{badge.description}</p>
    </div>
  );
};

const StatusIndicator = ({ label, value, isActive = false }: { label: string; value: string; isActive?: boolean }) => (
  <div className="text-center">
    <div className="text-sm text-muted-foreground mb-1">{label}</div>
    <div className="flex items-center gap-2 justify-center">
      {isActive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  </div>
);

export default DoctorVerifiedSection;
