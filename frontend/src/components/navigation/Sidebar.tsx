'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  CalendarIcon, 
  MapIcon, 
  ChartBarIcon, 
  Cog6ToothIcon, 
  UserIcon, 
  CreditCardIcon,
  TrophyIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { FaChair } from 'react-icons/fa';
import { ListBulletIcon } from '@heroicons/react/24/outline';
import { authService } from '@/lib/services/auth.service';

interface MenuItem {
  title: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  userRole: 'admin' | 'participant' | 'je';
  variant?: 'desktop' | 'mobile';
}

const iconMap = {
  dashboard: HomeIcon,
  users: UsersIcon,
  building: BuildingOfficeIcon,
  calendar: CalendarIcon,
  map: MapIcon,
  chart: ChartBarIcon,
  settings: Cog6ToothIcon,
  user: UserIcon,
  'credit-card': CreditCardIcon,
  award: TrophyIcon,
  help: QuestionMarkCircleIcon,
  list: ListBulletIcon,
  chair: FaChair,
};

export function Sidebar({ menuItems, userRole, variant = 'desktop' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'participant':
        return 'Participant';
      case 'je':
        return 'Junior-Entreprise';
      default:
        return role;
    }
  };

  const wrapperClass =
    variant === 'desktop'
      ? 'hidden md:flex md:flex-col fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-lg'
      : 'flex flex-col w-full h-full bg-sidebar';

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col h-full">
        {/* Header */}

        {/* User Info */}
        <div className="px-4 py-3 bg-sidebar-accent border-b border-sidebar-border">
          <Link href="/">
            <Image
              src="/assets/jobs2025_notext.svg"
              alt="JOBS 2025"
              width={240}
              height={60}
              className="h-12 w-64 mx-auto mb-4"
            />
          </Link>
          <div className="flex items-center">
            {user?.img ? (
              <img 
                src={getImageUrl(user.img) || ''}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div 
              className={`w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sidebar-primary-foreground text-sm font-semibold ${user?.img ? 'hidden' : ''}`}
            >
              {user?.firstName ? user.firstName[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {getRoleDisplayName(userRole)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] || HomeIcon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-sidebar-foreground rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
