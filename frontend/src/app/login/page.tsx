'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import LoginForm from '@/components/forms/login-form';

import { ModeToggle } from '@/components/theme-toggle';

const LoginPage = () => {
  const searchParams = useSearchParams();
  
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
    
    // Check for messages from URL params
    const message = searchParams.get('message');
    const errorMsg = searchParams.get('error');
    
    if (errorMsg) {
      toast.error(decodeURIComponent(errorMsg));
    } else if (message) {
      if (message.includes('pending') || message.includes('approval')) {
        toast.warning('Votre compte est en attente d\'approbation');
      } else if (message.includes('registration') || message.includes('complete')) {
        toast.info('Veuillez compléter votre inscription');
      } else {
        toast.success(decodeURIComponent(message));
      }
    }
  }, [searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      setResetMessage('Veuillez entrer votre adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setResetMessage('Veuillez entrer une adresse email valide');
      return;
    }

    setSendingReset(true);
    setResetMessage('');

    try {
      const response = await authService.forgotPassword({ email: forgotPasswordEmail });
      const successMsg = response.message || 'Email de réinitialisation envoyé!';
      setResetMessage(successMsg);
      toast.success(successMsg);
      setForgotPasswordEmail('');
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setResetMessage('');
      }, 3000);
    } catch (err: any) {
      const message = err.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation.';
      setResetMessage(message);
      toast.error(message);
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      {!mounted ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red"></div>
        </div>
      ) : (
        <>
          <div className="w-full max-w-md mx-auto">
            <div className="absolute top-4 right-4">
              <ModeToggle />
            </div>
            <div className="text-center mb-8">
              <a href="/">
                <Image
                  src="/assets/jobs2025_text.svg"
                  alt="JOBS 2025"
                  width={240}
                  height={120}
                  className="mx-auto"
                />
              </a>
            </div>

            <Card className="bg-card border-border shadow-2xl shadow-red/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Connexion
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Accédez à votre espace JOBS 2K26
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm 
                  onForgotPassword={() => setShowForgotPasswordModal(true)}
                />

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <Link
                      href="/signup"
                      className="text-red hover:underline font-semibold"
                    >
                      S'inscrire
                    </Link>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border text-center">
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-red transition-colors"
                  >
                    ← Retour à l'accueil
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forgot Password Modal */}
          {showForgotPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    Mot de passe oublié
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Entrez votre email pour recevoir un lien de réinitialisation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="votre-email@exemple.com"
                        required
                        disabled={sendingReset}
                        autoComplete="email"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:ring-red focus:border-red"
                        suppressHydrationWarning
                      />
                    </div>

                    {resetMessage && (
                      <Alert
                        className={`border-none ${
                          resetMessage.includes("envoyé") || resetMessage.includes("Email")
                            ? "bg-green-900/50 text-green-300"
                            : "bg-red-900/50 text-red-300"
                        }`}
                      >
                        <AlertDescription>{resetMessage}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex space-x-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForgotPasswordModal(false);
                          setForgotPasswordEmail('');
                          setResetMessage('');
                        }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                        disabled={sendingReset}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={sendingReset}
                        className="flex-1 bg-red hover:bg-red/90 text-white"
                      >
                        {sendingReset ? 'Envoi...' : 'Envoyer'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LoginPage;