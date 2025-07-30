'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plane,
  User,
  UserCircle,
  LogOut,
  ArrowLeft,
  Menu,
  Settings
} from 'lucide-react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  onBackClick?: () => void;
  onMenuToggle?: () => void;
  showMenuToggle?: boolean;
}

export function Navbar({
  title = "Transport Reporting System",
  subtitle = "Airport Operations Management",
  showBackButton = false,
  backUrl,
  onBackClick,
  onMenuToggle,
  showMenuToggle = false
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-card border-b border-border shadow-sm">
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div 
              className="p-2 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => router.push('/dashboard')}
              title="Go to Events"
            >
              <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold sm:text-lg lg:text-xl tracking-tight text-foreground truncate">{title}</h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block font-medium truncate">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-accent hover:text-accent-foreground p-2 sm:px-3 sm:py-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </Button>
            )}



            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent hover:text-accent-foreground p-2"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleProfile}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            {showMenuToggle && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={onMenuToggle}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 