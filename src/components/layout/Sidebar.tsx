'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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

  const defaultItems: SidebarItem[] = [
    { icon: BarChart3, label: 'Dashboard', active: false, href: `/events/${eventId}` },
    { icon: Calendar, label: 'Flight Schedule', active: false, href: `/events/${eventId}/flight-schedules` },
    { icon: FileText, label: 'Transport Reports', active: false, href: `/events/${eventId}/reports` },
    { icon: Clock, label: 'Real-time Status', active: false, href: `/events/${eventId}/status` },
    { icon: Users, label: 'Passengers', active: false, href: `/events/${eventId}/passengers` },
    { icon: FileText, label: 'Documents', active: false, href: `/events/${eventId}/documents` },
    { icon: Settings, label: 'Settings', active: false, href: `/events/${eventId}/settings` }
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
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 lg:z-0
        w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-bold text-gray-800">Navigation</h2>
          <p className="text-sm text-gray-600 mt-1">Event Management</p>
        </div>
        <nav className="mt-2 px-2">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-4 py-3 mx-2 my-1 text-sm font-medium cursor-pointer transition-all duration-200 rounded-lg ${
                item.active 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
              onClick={() => handleItemClick(item.href)}
            >
              <div className={`p-1.5 rounded-md mr-3 ${
                item.active ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                <item.icon className={`h-4 w-4 ${item.active ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
} 