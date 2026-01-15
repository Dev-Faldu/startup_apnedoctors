import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Shield, Stethoscope } from 'lucide-react';

export function UserMenu() {
  const { user, signOut, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate('/login')}>
          Sign In
        </Button>
        <Button onClick={() => navigate('/signup')}>
          Get Started
        </Button>
      </div>
    );
  }

  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <div className="flex items-center gap-1 mt-1">
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
              {isDoctor && !isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <Stethoscope className="h-3 w-3" />
                  Doctor
                </span>
              )}
              {!isDoctor && !isAdmin && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  Patient
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          Settings
        </DropdownMenuItem>
        {(isDoctor || isAdmin) && (
          <DropdownMenuItem onClick={() => navigate('/doctor')}>
            Doctor Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
