'use client';

import { useEffect, useState } from 'react';
import { zoneService, Zone } from '@/lib/services/zone.service';
import { jeService } from '@/lib/services/je.service';
import { JE } from '@/types/je.types';
import { JeLayout } from '@/components/layout/JELayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function JEZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [myJe, setMyJe] = useState<JE | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [zonesData, jeData] = await Promise.all([
        zoneService.getAll(),
        jeService.getProfile()
      ]);
      setZones(zonesData);
      setMyJe(jeData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleZoneClick = async (zone: Zone) => {
    if (!myJe) return;

    const isReservedByMe = zone.jes.some(j => j.id === myJe.id);
    const isReservedByOthers = zone.jes.length > 0 && !isReservedByMe;

    if (isReservedByOthers) {
      toast.error('This zone is already reserved by another JE');
      return;
    }

    if (isReservedByMe) {
      toast.info('You have already reserved this zone');
      return;
    }

    try {
      await zoneService.reserveZone(zone.id);
      toast.success(`Successfully reserved zone ${zone.name}`);
      fetchData(); // Refresh to show updates
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reserve zone');
    }
  };

  if (loading) {
    return (
      <JeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </JeLayout>
    );
  }

  return (
    <JeLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Réservation de Stand</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sélectionnez votre emplacement. Cliquez sur une zone libre (verte) pour la réserver.
            Si vous changez de zone, l'ancienne sera automatiquement libérée.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {zones.map((zone) => {
            const isReservedByMe = myJe ? zone.jes.some(j => j.id === myJe.id) : false;
            const isReservedByOthers = zone.jes.length > 0 && !isReservedByMe;
            
            return (
              <Card 
                key={zone.id}
                onClick={() => handleZoneClick(zone)}
                className={cn(
                  "cursor-pointer transition-all duration-200 border-2",
                  isReservedByOthers 
                    ? "bg-black border-black text-white opacity-80 cursor-not-allowed" 
                    : isReservedByMe
                      ? "bg-red-700 border-red-700 text-white shadow-lg scale-[1.02]"
                      : "bg-green-50 border-green-500 hover:bg-green-100 hover:shadow-md"
                )}
              >
                <CardHeader className="p-6 text-center">
                  <CardTitle className={cn(
                    "text-4xl font-bold",
                    isReservedByOthers || isReservedByMe ? "text-white" : "text-green-700"
                  )}>
                    {zone.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  {isReservedByOthers ? (
                    <span className="text-sm font-medium uppercase tracking-wider">Réservé</span>
                  ) : isReservedByMe ? (
                    <span className="text-sm font-medium uppercase tracking-wider">Votre Zone</span>
                  ) : (
                    <span className="text-sm font-medium uppercase tracking-wider text-green-600">Disponible</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </JeLayout>
  );
}
