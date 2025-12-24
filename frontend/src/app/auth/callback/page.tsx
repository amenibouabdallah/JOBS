'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const status = searchParams.get('status');
        const error = searchParams.get('error');

        // Handle OAuth error
        if (error) {
          let errorMessage = decodeURIComponent(error);
          
          // Handle specific error for existing credentials
          if (errorMessage.includes('Email already registered')) {
            setError('Ce compte existe déjà avec un mot de passe. Veuillez vous connecter avec vos identifiants.');
            // Redirect to login after showing error
            setTimeout(() => {
              router.push('/login?error=' + encodeURIComponent('Compte existant - utilisez vos identifiants'));
            }, 3000);
          } else {
            setError(`Erreur d'authentification: ${errorMessage}`);
          }
          return;
        }

        // Handle missing token (server-side processed OAuth)
        if (!token) {
          setError('No authentication token received from server');
          return;
        }

        // Token is already processed by server, just need to store it and get user info
        try {
          // Store the token temporarily to validate and get user info
          localStorage.setItem('token', token);
          
          // Get user profile with the token
          const user = await authService.getCurrentUser();
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(user));
          
          // Redirect based on user role and status
          if (status === 'approved' || user.status === 'APPROVED') {
            // Redirect to role-specific dashboard
            switch (user.role) {
              case 'PARTICIPANT':
                router.push('/participant');
                break;
              case 'JE':
                router.push('/je');
                break;
              case 'ADMIN':
                router.push('/admin');
                break;
              default:
                router.push('/dashboard');
            }
          } else if (status === 'verified' || user.status === 'VERIFIED') {
            router.push('/login?message=Account pending approval');
          } else {
            router.push('/login?message=Please complete your registration');
          }
        } catch (profileError: any) {
          console.error('Error getting user profile:', profileError);
          setError('Failed to complete authentication. Please try again.');
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only run if we have search params
    if (searchParams.toString()) {
      handleCallback();
    } else {
      setError('Invalid callback - missing parameters');
      setLoading(false);
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red mx-auto mb-4"></div>
          <p className="text-lg">Finalizing your authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Authentication Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red text-white px-6 py-2 rounded hover:bg-red/90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
