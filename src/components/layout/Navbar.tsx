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
  Menu
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
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl border-b border-gray-700">
      <div className="px-4 py-4 lg:px-6 lg:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Plane className="h-6 w-6 lg:h-7 lg:w-7 text-blue-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold lg:text-xl tracking-tight">{title}</h1>
              <p className="text-gray-300 text-xs lg:text-sm hidden sm:block font-medium">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800 p-2 lg:px-3 lg:py-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </Button>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800 p-2"
                >
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleProfile}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
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
                className="lg:hidden text-white hover:bg-gray-800"
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