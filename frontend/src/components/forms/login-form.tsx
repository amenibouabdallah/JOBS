'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/services/auth.service';
import { toast } from 'sonner';

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export default function LoginForm({ onForgotPassword }: LoginFormProps) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return false;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  };

  const getRedirectPath = (role: string): string => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return '/admin';
      case 'JE':
        return '/je';
      case 'PARTICIPANT':
        return '/participant';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call login endpoint
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      const data = response;

      // Check response status
      if (data.status === 'created') {
        // Email not verified
        setError(data.message || 'Vérifiez votre email via le lien envoyé par mail');
        toast.warning('Vérifiez votre email pour activer votre compte');
        return;
      }

      if (data.status === 'verified') {
        // Not approved by JE admin
        setError(data.message || 'Attendez la validation de votre JE');
        toast.warning('Votre compte est en attente d\'approbation par votre JE');
        return;
      }

      // Check if we have tokens (approved status)
      if (data.accessToken && data.refreshToken && data.user) {
        // Store tokens and user in Zustand
        setAuth(data.accessToken, data.refreshToken, data.user);

        toast.success('Connexion réussie !');
        
        // Redirect based on role
        const redirectPath = getRedirectPath(data.user.role);
        router.push(redirectPath);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de connexion. Veuillez réessayer.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.continueWithGoogle();
    } catch (err: any) {
      toast.error('Erreur lors de la connexion avec Google');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-900 border-red-700 text-white"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre-email@exemple.com"
          required
          disabled={isLoading}
          autoComplete="email"
          className="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">
          Mot de passe
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            autoComplete="current-password"
            className="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 text-red bg-gray-700 border-gray-600 focus:ring-red"
          />
          <label
            htmlFor="remember"
            className="ml-2 block text-sm text-muted-foreground"
          >
            Se souvenir de moi
          </label>
        </div>
        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-red-500 hover:underline"
          >
            Mot de passe oublié ?
          </button>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-red-800 hover:bg-red-600 text-white font-bold h-12"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Connexion...</span>
          </div>
        ) : (
          'Se connecter'
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Ou</span>
        </div>
      </div>

      {/* Google Login */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full h-12 bg-background border-border hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuer avec Google
      </Button>
    </form>
  );
}
