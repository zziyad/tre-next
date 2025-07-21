'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DefaultLayoutProps {
  children: React.ReactNode;
  eventId?: string;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  sidebarItems?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    href: string;
  }>;
  showSidebar?: boolean;
  showMenuToggle?: boolean;
}

export function DefaultLayout({
  children,
  eventId,
  title,
  subtitle,
  showBackButton = false,
  backUrl,
  sidebarItems,
  showSidebar = true,
  showMenuToggle = true
}: DefaultLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <Navbar
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        backUrl={backUrl}
        onMenuToggle={handleMenuToggle}
        showMenuToggle={showMenuToggle}
      />

      <div className="flex relative">
        {/* Sidebar */}
        {showSidebar && eventId && (
          <Sidebar
            eventId={eventId}
            items={sidebarItems}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Desktop Sidebar Toggle */}
          {showSidebar && showMenuToggle && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex hover:bg-gray-50"
                onClick={handleMenuToggle}
              >
                <Menu className="h-4 w-4 mr-2" />
                {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
              </Button>
            </div>
          )}

          {/* Page Content */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 