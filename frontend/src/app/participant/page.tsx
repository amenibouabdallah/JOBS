'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { participantService } from '@/lib/services/participant.service';
import type { Participant } from '@/types/participant.types';
import type { User } from '@/types/auth.types';
import { ParticipantLayout } from '@/components/layout/ParticipantLayout';
import { DashboardStatusCard } from '@/components/participant/DashboardStatusCard';
import { DashboardActionCard } from '@/components/participant/DashboardActionCard';

export default function ParticipantDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await participantService.getParticipantProfile();
        setParticipant(profile);
        setUser(profile.user);
      } catch (error: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Tableau de Bord
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Aperçu de votre participation
            </p>
          </div>

          {/* Status Section */}
          {user && participant && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <DashboardStatusCard
                title="Statut du Compte"
                value={user.status.toLowerCase()}
                statusColor={user.status === 'APPROVED' ? 'green' : 'yellow'}
              />
              
              <DashboardStatusCard
                title="Paiement"
                value={participant.payDate ? 'Payé' : 'Non Payé'}
                statusColor={participant.payDate ? 'green' : 'red'}
              />
              
              <DashboardStatusCard
                title="Junior Entreprise"
                value={participant.je?.name || 'Non Assigné'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
            </div>
          )}

          {/* Quick Actions Grid */}
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Accès Rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardActionCard
              title="Mon Profil"
              description="Gérer vos informations personnelles"
              onClick={() => router.push('/participant/profile')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <DashboardActionCard
              title="Paiements"
              description="Historique et factures"
              onClick={() => router.push('/participant/payment')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
            />

            <DashboardActionCard
              title="Programme"
              description="Vos activités et planning"
              onClick={() => router.push('/participant/activities')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </ParticipantLayout>
  );
}
