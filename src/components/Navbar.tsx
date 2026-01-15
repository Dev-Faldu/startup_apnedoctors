import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, Stethoscope, Video, Settings } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isDoctor, isAdmin } = useAuth();

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Technology", href: "#technology" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "#about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Activity className="w-8 h-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Apne<span className="text-primary text-glow-sm">Doctors</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user && (
              <>
                <Link to="/live">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                    <Video className="h-4 w-4" />
                    Live AI
                  </Button>
                </Link>
                {(isDoctor || isAdmin) && (
                  <Link to="/doctor">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                      <Stethoscope className="h-4 w-4" />
                      Doctor Portal
                    </Button>
                  </Link>
                )}
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/assessment">
                  <Button variant="hero" size="sm">
                    Start Assessment
                  </Button>
                </Link>
              </>
            )}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/30">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                {user ? (
                  <>
                    <Link to="/live" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full gap-2">
                        <Video className="h-4 w-4" />
                        Live AI
                      </Button>
                    </Link>
                    {(isDoctor || isAdmin) && (
                      <Link to="/doctor" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" size="sm" className="w-full gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Doctor Portal
                        </Button>
                      </Link>
                    )}
                    <Link to="/settings" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                    <Link to="/assessment" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" size="sm" className="w-full">
                        Start Assessment
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
