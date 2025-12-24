'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import InitialSignupForm from '@/components/forms/initial-signup-form';
import { ModeToggle } from '@/components/theme-toggle';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/assets/jobs2025_text.svg"
              alt="JOBS 2025"
              width={240}
              height={120}
              className="mx-auto"
            />
          </Link>
        </div>

        {/* Initial Signup Form - Only Auth Step */}
        <InitialSignupForm />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="text-red-700 hover:underline font-semibold"
            >
              Se connecter
            </Link>
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-red-700 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
