'use client';

import React, { ReactNode, useEffect } from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

interface ParticipantLayoutProps {
  children: ReactNode;
}

import { ModeToggle } from '../theme-toggle';

export function ParticipantLayout({ children }: ParticipantLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'PARTICIPANT')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'PARTICIPANT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const participantMenuItems = [
    { title: 'Dashboard', href: '/participant', icon: 'dashboard' },
    { title: 'Programme', href: '/participant/program', icon: 'calendar' },
    { title: 'Profil', href: '/participant/profile', icon: 'user' },
    { title: 'Paiement', href: '/payment', icon: 'credit-card' },
    { title: 'Places', href: '/participant/places', icon: 'chair' },
    { title: 'Certificat', href: '/participant/certificate', icon: 'award' },
    { title: 'Support', href: '/participant/support', icon: 'help' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar menuItems={participantMenuItems} userRole="participant" />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background border-b border-border flex items-center px-4 justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <button aria-label="Ouvrir le menu" className="text-foreground">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="w-64">
              <Sidebar menuItems={participantMenuItems} userRole="participant" variant="mobile" />
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
