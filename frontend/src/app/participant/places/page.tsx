'use client';

import { useState, useEffect } from 'react';
import { zoneService } from '@/lib/services/zone.service';
import { participantService } from '@/lib/services/participant.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ParticipantLayout } from '@/components/layout/ParticipantLayout';
import { set } from 'zod';
import { FaChair } from 'react-icons/fa';

export default function PlacesPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [maxPlaces, setMaxPlaces] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [myPlace, setMyPlace] = useState<string | null>(null);
  const [takenPlaces, setTakenPlaces] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, JeStats] = await Promise.all([
        participantService.getParticipantProfile(),
        zoneService.getMyJeStats()
      ]);

      setProfile(profileData);
      setMyPlace(profileData.placeName);

      if (JeStats.hasJe) {
        setStats(JeStats);
        setMaxPlaces(JeStats.paidCount);
        setTakenPlaces(JeStats.reservedPlaces || []);
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (number: number) => {
    try {
      await zoneService.reservePlace(number);
      toast.success(`Place ${number} reserved successfully`);
      fetchData(); // Refresh to show updated status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reserve place');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!profile?.je) {
    return (
      <ParticipantLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Réservation de Place</h1>
          <p>Vous n'êtes pas rattaché à une Junior Entreprise.</p>
        </div>
      </ParticipantLayout>
    );
  }

  if (!profile.payDate && !profile.firstPayDate) {
    return (
      <ParticipantLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Réservation de Place</h1>
          <p className="text-red-500">Vous devez payer votre participation pour réserver une place.</p>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Réservation de Place</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Votre Zone: {stats.reservedZone || 'Non assignée'}</CardTitle>
          </CardHeader>
          <CardContent>
            {myPlace ? (
              <div className="text-center py-8">
                <p className="text-lg mb-2">Vous avez réservé la place :</p>
                <div className="text-4xl font-bold text-green-600">{myPlace}</div>
                <p className="text-sm text-gray-500 mt-4">
                  Pour changer de place, sélectionnez-en une nouvelle ci-dessous.
                </p>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">
                Sélectionnez une place libre ci-dessous.
              </p>
            )}
          </CardContent>
        </Card>

        {stats.reservedZone ? (
          <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-[repeat(15,minmax(0,1fr))] gap-2">
            {Array.from({ length: maxPlaces }, (_, i) => i + 1).map((num) => {
              const placeName = `${stats.reservedZone}_${num}`;
              const isTaken = takenPlaces.includes(placeName);
              const isMine = myPlace === placeName;

              return (
                <Button
                  key={num}
                  variant={isMine ? "default" : "outline"}
                  disabled={isTaken && !isMine}
                  className={`h-10 w-full p-0 text-xs ${
                    isMine 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : isTaken 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'hover:border-green-500 hover:text-green-600'
                  }`}
                  onClick={() => handleReserve(num)}
                  title={isTaken && !isMine ? "Déjà réservé" : `Réserver la place ${num}`}
                >
                  <div className='text-foreground'><FaChair/> <p>{stats.reservedZone}_{num}</p></div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-yellow-600 bg-yellow-50 p-4 rounded">
            Votre JE n'a pas encore de zone assignée. Veuillez contacter votre responsable.
          </div>
        )}
      </div>
    </ParticipantLayout>
  );
}
