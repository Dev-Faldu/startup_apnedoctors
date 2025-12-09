import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import TechnologySection from "@/components/TechnologySection";
import CameraScanSection from "@/components/CameraScanSection";
import DoctorVerifiedSection from "@/components/DoctorVerifiedSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import VisionSection from "@/components/VisionSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TechnologySection />
        <CameraScanSection />
        <DoctorVerifiedSection />
        <HowItWorksSection />
        <VisionSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
