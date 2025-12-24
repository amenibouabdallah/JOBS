'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Image from 'next/image';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const status = searchParams.get('status');
      const message = searchParams.get('message');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        toast.error("Erreur d'authentification Google");
        return;
      }

      // Handle different statuses
      if (status === 'created') {
        // Email not verified
        setError(message || 'Vérifiez votre email via le lien envoyé par mail');
        toast.info(message || 'Vérifiez votre email via le lien envoyé par mail');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (status === 'verified') {
        // Not approved by JE admin yet
        setError(message || 'Attendez la validation de votre JE');
        toast.warning(message || 'Attendez la validation de votre JE');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      // Status is 'approved' - tokens should be present
      if (!accessToken || !refreshToken) {
        setError('Tokens manquants');
        return;
      }

      try {
        // Call /auth/me to get user profile using the accessToken
        const response = await apiClient.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        const userProfile = response.data;

        // Save everything to Zustand store (persists to localStorage)
        setAuth(accessToken, refreshToken, userProfile);

        toast.success('Connexion réussie !');
        const redirectPath = getRedirectPath(userProfile.role);
        router.replace(redirectPath);

      } catch (err: any) {
        console.error('Google callback error:', err);
        const errorMessage = err.response?.data?.message || err.message || "Erreur lors de l'authentification Google";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setAuth]);

  const getRedirectPath = (role: string): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'je':
        return '/je';
      case 'participant':
        return '/participant';
      default:
        return '/dashboard';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="w-full max-w-md mx-auto text-center">
          <Image
            src="/assets/jobs2025_text.svg"
            alt="JOBS 2025"
            width={240}
            height={120}
            className="mx-auto mb-8"
          />
          
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-300 mb-2">
              Erreur d'authentification
            </h2>
            <p className="text-red-200 text-sm">{error}</p>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <Image
          src="/assets/jobs2025_text.svg"
          alt="JOBS 2025"
          width={240}
          height={120}
          className="mx-auto mb-8"
        />
        
        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">
            Authentification Google en cours...
          </h2>
          <p className="text-gray-400">
            Veuillez patienter pendant que nous finalisons votre connexion.
          </p>
        </div>
      </div>
    </div>
  );
}