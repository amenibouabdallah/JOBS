'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { adminService } from '@/lib/services/admin.service';
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  MapIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportsData {
  participants: {
    total: number;
    approved: number;
    paid: number;
    unpaid: number;
    recent: number;
    byRole: Array<{ role: string; count: number }>;
  };
  jes: {
    total: number;
    topJEsByParticipants: Array<{ id: number; name: string; participantCount: number }>;
  };
  activities: {
    total: number;
    byType: Array<{ id: number; name: string; count: number }>;
  };
  payments: {
    paymentSheets: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    participants: {
      total: number;
      paid: number;
      unpaid: number;
    };
  };
  zones: {
    total: number;
    reserved: number;
    available: number;
  };
  salles: {
    total: number;
    byType: Array<{ type: string; count: number }>;
  };
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminService.getReports();
      console.log('Reports data:', response);
      setData(response);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Rapports et Statistiques</h1>
            <p className="text-muted-foreground mt-1">Vue d'ensemble détaillée de l'événement</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </div>
      </AdminLayout>
    );
  }

  // Safety checks for data structure
  if (!data.participants || !data.jes || !data.activities || !data.payments || !data.zones || !data.salles) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Données incomplètes</p>
            <p className="text-sm text-muted-foreground">Veuillez actualiser la page</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const participantPaymentRate = data.participants.total > 0
    ? ((data.participants.paid / data.participants.total) * 100).toFixed(1)
    : '0';

  const participantApprovalRate = data.participants.total > 0
    ? ((data.participants.approved / data.participants.total) * 100).toFixed(1)
    : '0';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Rapports et Statistiques</h1>
            <p className="text-muted-foreground mt-1">Vue d'ensemble détaillée de l'événement JOBS 2026</p>
          </div>
          <ChartBarIcon className="h-8 w-8 text-primary" />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.participants.total}</div>
              <p className="text-xs text-muted-foreground">
                {data.participants.recent} nouvelles inscriptions (7 derniers jours)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Junior-Entreprises</CardTitle>
              <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.jes.total}</div>
              <p className="text-xs text-muted-foreground">JE enregistrées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activités</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activities.total}</div>
              <p className="text-xs text-muted-foreground">Activités programmées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zones</CardTitle>
              <MapIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.zones.total}</div>
              <p className="text-xs text-muted-foreground">
                {data.zones.reserved} réservées, {data.zones.available} disponibles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Participants Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des Participants</CardTitle>
              <CardDescription>État d'inscription et de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total des participants</span>
                  <span className="text-sm font-bold">{data.participants.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Approuvés</span>
                  </div>
                  <span className="text-sm">{data.participants.approved} ({participantApprovalRate}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Payés</span>
                  </div>
                  <span className="text-sm">{data.participants.paid} ({participantPaymentRate}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircleIcon className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Non payés</span>
                  </div>
                  <span className="text-sm">{data.participants.unpaid}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participants par Rôle</CardTitle>
              <CardDescription>Répartition selon les fonctions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.participants.byRole.map((roleData) => (
                  <div key={roleData.role} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{roleData.role}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{roleData.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((roleData.count / data.participants.total) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de Paiement</CardTitle>
            <CardDescription>Feuilles de paiement et statuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total feuilles</p>
                <p className="text-2xl font-bold">{data.payments.paymentSheets.total}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">En attente</p>
                </div>
                <p className="text-2xl font-bold">{data.payments.paymentSheets.pending}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">Approuvées</p>
                </div>
                <p className="text-2xl font-bold">{data.payments.paymentSheets.approved}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <XCircleIcon className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-muted-foreground">Rejetées</p>
                </div>
                <p className="text-2xl font-bold">{data.payments.paymentSheets.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top JEs by Participants */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 JE par Participants</CardTitle>
            <CardDescription>Junior-Entreprises avec le plus de participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.jes.topJEsByParticipants.map((je, index) => (
                <div key={je.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{je.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold">{je.participantCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Activités par Type</CardTitle>
            <CardDescription>Répartition des activités programmées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activities.byType.map((type) => (
                <div key={type.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{type.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((type.count / data.activities.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salles by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Salles par Type</CardTitle>
            <CardDescription>Répartition des salles disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.salles.byType.map((salle) => (
                <div key={salle.type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{salle.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{salle.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((salle.count / data.salles.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
