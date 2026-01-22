import { Link } from "react-router-dom";
import { Activity, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-card/50 border-t border-border/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          {/* Brand */}
<div className="md:col-span-1">
  <Link to="/" className="flex items-center gap-1.5 shrink-0 mb-4">
    <img
      src="/logo_apnedoctors.png"
      alt="ApneDoctors Logo"
      className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
      />
  </Link>

            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Intelligent remote healthcare platform powered by multimodal AI. 
              Bringing hospital-level preliminary assessment to your smartphone.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" label="Twitter" />
              <SocialLink href="#" label="LinkedIn" />
              <SocialLink href="#" label="GitHub" />
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#technology">Technology</FooterLink>
              <FooterLink href="#how-it-works">How It Works</FooterLink>
              <FooterLink href="#about">About</FooterLink>
            </ul>
          </div>

          {/* AI Tools Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">AI Tools</h4>
            <ul className="space-y-3 text-sm">
              <FooterRouteLink to="/clinical-assessment">Clinical Assessment</FooterRouteLink>
              <FooterRouteLink to="/document-analysis">Document Analysis</FooterRouteLink>
              <FooterRouteLink to="/live">Live AI Consultation</FooterRouteLink>
              <FooterRouteLink to="/assessment">Quick Assessment</FooterRouteLink>
            </ul>
          </div>

          {/* Account & Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Account</h4>
            <ul className="space-y-3 text-sm mb-6">
              <FooterRouteLink to="/login">Sign In</FooterRouteLink>
              <FooterRouteLink to="/signup">Create Account</FooterRouteLink>
              <FooterRouteLink to="/settings">Settings</FooterRouteLink>
            </ul>
            
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                er.devfaldu@gmail.com (Dev Faldu) 
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                +91 63536 85893 
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                Arpan Hospital, Rajkot, Gujarat, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 ApneDoctors. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Medical Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a href={href} className="text-muted-foreground hover:text-primary transition-colors">
      {children}
    </a>
  </li>
);

const FooterRouteLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-muted-foreground hover:text-primary transition-colors">
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
    aria-label={label}
  >
    <span className="text-xs font-medium">{label[0]}</span>
  </a>
);

export default Footer;
