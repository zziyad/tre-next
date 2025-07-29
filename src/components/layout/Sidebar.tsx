'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Clock,
  Users,
  Settings,
  Plane
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  href: string;
}

interface SidebarProps {
  eventId: string;
  items?: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ eventId, items, isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const defaultItems: SidebarItem[] = [
    { icon: BarChart3, label: 'Dashboard', active: pathname === `/events/${eventId}`, href: `/events/${eventId}` },
    { icon: Calendar, label: 'Flight Schedule', active: pathname === `/events/${eventId}/flight-schedules`, href: `/events/${eventId}/flight-schedules` },
            { icon: FileText, label: 'Transport Reports', active: pathname === `/events/${eventId}/transport-reports`, href: `/events/${eventId}/transport-reports` },
    { icon: Clock, label: 'Real-time Status', active: pathname === `/events/${eventId}/status`, href: `/events/${eventId}/status` },
    { icon: Users, label: 'Passengers', active: pathname === `/events/${eventId}/passengers`, href: `/events/${eventId}/passengers` },
    { icon: FileText, label: 'Documents', active: pathname === `/events/${eventId}/documents`, href: `/events/${eventId}/documents` },
    { icon: Settings, label: 'Settings', active: pathname === `/events/${eventId}/settings`, href: `/events/${eventId}/settings` }
  ];

  const sidebarItems = items || defaultItems;

  const handleItemClick = (href: string) => {
    onToggle(); // Close sidebar on mobile
    router.push(href);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 lg:z-0
        w-64 bg-card border-r border-border shadow-lg lg:shadow-none min-h-screen transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plane className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Navigation</h2>
              <p className="text-xs text-muted-foreground">Event Management</p>
            </div>
          </div>
        </div>
        <nav className="mt-2 px-2 py-2">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-3 py-2.5 mx-1 my-0.5 text-sm font-medium cursor-pointer transition-all duration-200 rounded-md ${
                item.active 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => handleItemClick(item.href)}
            >
              <div className={`p-1.5 rounded-md mr-3 ${
                item.active ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                <item.icon className={`h-4 w-4 ${item.active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
} 