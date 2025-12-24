'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { authService } from '@/lib/services/auth.service';
import { toast } from 'sonner';
import { ModeToggle } from '@/components/theme-toggle';

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant ou invalide.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de réinitialisation manquant.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting reset with token:', token);
      await authService.resetPassword({
        token,
        password,
        confirmPassword,
      });
      
      setSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Une erreur est survenue.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto border-red/20 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red">Succès !</CardTitle>
          <CardDescription>
            Votre mot de passe a été réinitialisé. Vous allez être redirigé vers la page de connexion.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Button asChild className="bg-red hover:bg-red/90">
            <Link href="/login">Se connecter maintenant</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-red/20 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-red">Réinitialisation du mot de passe</CardTitle>
        <CardDescription>
          Entrez votre nouveau mot de passe ci-dessous.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-red-700 hover:bg-red-900 text-white"
            disabled={loading || !token}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-red hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <div className="mb-4 flex flex-col items-center">
        <div className="relative w-64 h-64">
          <Link href="/"><Image
            src="/assets/jobs2025_text.svg"
            alt="Jobs 2K26"
            fill
            className="object-contain"
            priority
          />
          </Link>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red"></div>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
};

export default ResetPasswordPage;
