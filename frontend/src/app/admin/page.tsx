'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { UsersIcon, BuildingOfficeIcon, CalendarIcon, MapIcon } from '@heroicons/react/24/outline';
import { participantService } from '@/lib/services/participant.service';
import { jeService } from '@/lib/services/je.service';
import { activityService } from '@/lib/services/activity.service';
import { salleService } from '@/lib/services/salle.service';
import { DashboardStats, Stat } from '@/components/admin/DashboardStats';
import { JobsManagement } from '@/components/admin/JobsManagement';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([
    {
      title: 'Participants',
      value: '0',
      description: 'Participants inscrits',
      icon: UsersIcon,
      color: 'text-blue-500',
    },
    {
      title: 'Junior-Entreprises',
      value: '0',
      description: 'JE enregistrées',
      icon: BuildingOfficeIcon,
      color: 'text-green-500',
    },
    {
      title: 'Activités',
      value: '0',
      description: 'Activités programmées',
      icon: CalendarIcon,
      color: 'text-purple-500',
    },
    {
      title: 'Salles',
      value: '0',
      description: 'Salles disponibles',
      icon: MapIcon,
      color: 'text-orange-500',
    },
  ]);
  useEffect(() => {
    Promise.all([
      participantService.getAllParticipants(),
      jeService.fetchJEs(),
      activityService.adminList(),
      salleService.list(),
    ]).then(([participants, jes, activities, salles]) => {
      setStats([
        { ...stats[0], value: participants.length.toString() },
        { ...stats[1], value: jes.length.toString() },
        { ...stats[2], value: activities.length.toString() },
        { ...stats[3], value: salles.length.toString() },
      ]);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground mt-1">Vue d'ensemble de JOBS 2026</p>
          </div>
        </div>

        <DashboardStats stats={stats} />

        <JobsManagement />
      </div>
    </AdminLayout>
  );
}
