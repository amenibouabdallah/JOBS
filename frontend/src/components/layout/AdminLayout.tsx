'use client';

import React, { ReactNode, useEffect } from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

import { ModeToggle } from '../theme-toggle';

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }


  const adminMenuItems = [
    { title: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { title: 'Participants', href: '/admin/participants', icon: 'users' },
    { title: 'Junior-Entreprises', href: '/admin/jes', icon: 'building' },
    { title: 'Activities', href: '/admin/activities', icon: 'calendar' },
    { title: 'Salles', href: '/admin/salles', icon: 'building' },
    { title: 'Activity Types', href: '/admin/activity-types', icon: 'list' },
    { title: 'Zones', href: '/admin/zones', icon: 'map' },
    { title: 'Reports', href: '/admin/reports', icon: 'chart' },
    { title: 'Profile', href: '/admin/profile', icon: 'user' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar menuItems={adminMenuItems} userRole="admin" />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background border-b border-border flex items-center px-4 justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <button aria-label="Ouvrir le menu" className="text-foreground">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {/* Reuse Sidebar inside the drawer for mobile */}
            <div className="w-11/12 ">
              <Sidebar menuItems={adminMenuItems} userRole="admin" variant="mobile" />
            </div>
          </SheetContent>
        </Sheet>
        <div className="pr-1">
          <ModeToggle />
        </div>
      </div>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="hidden md:block absolute top-4 right-4">
          <ModeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
