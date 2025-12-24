'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PersonalInfoStep } from '@/components/forms/signup-steps/PersonalInfoStep';
import { JEAssociationStep } from '@/components/forms/signup-steps/JEAssociationStep';
import { authService } from '@/lib/services/auth.service';
import { toast } from 'sonner';
import { Stepper } from '@/components/Stepper';
import { SignupFormData, StepDefinition } from '@/types/form.types';
import { ModeToggle } from '@/components/theme-toggle';

const STEPS: StepDefinition[] = [
  { id: 1, title: 'Informations personnelles', description: 'Vos données personnelles' },
  { id: 2, title: 'Association JE', description: 'Rejoindre votre Junior-Entreprise' },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    sexe: undefined,
    birthdate: '',
    linkedinLink: '',
    cinPassport: '',
    profileImage: '',
    selectedJEId: '',
    participantRole: undefined,
    jeCode: '',
    agreedTerms: false,
  });

  useEffect(() => {
    // Only run in browser to avoid hydration mismatch
    if (typeof window === 'undefined') return;

    // Check if coming from Google OAuth with initialToken
    const initialToken = searchParams.get('initialToken');
    const userId = searchParams.get('userId');

    if (initialToken && userId) {
      // Store initialToken for later use
      authService.setInitialToken(initialToken, parseInt(userId));
      
      // Clean URL
      window.history.replaceState({}, '', '/signup/complete');
      
      // Fetch user data to prefill form
      fetchUserData(parseInt(userId));
      toast.success('Complétez votre profil pour terminer l\'inscription');
    } else {
      // Check if initialToken already stored (page refresh)
      const storedToken = authService.getInitialToken();
      const storedUserId = authService.getInitialUserId();

      if (storedToken && storedUserId) {
        // Fetch user data to prefill form
        fetchUserData(storedUserId);
      } else {
        // No initialToken found
        toast.error('Session expirée. Veuillez recommencer.');
        router.push('/signup');
      }
    }
  }, [searchParams, router]);

  // Fetch existing user data from backend
  const fetchUserData = async (userId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${userId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const userData = await response.json();
        const participant = userData.participants?.[0];

        setFormData((prev) => ({
          ...prev,
          email: userData.email || prev.email,
          firstName: participant?.firstName || '',
          lastName: participant?.lastName || '',
          sexe: participant?.sexe || undefined,
          phone: participant?.phone || '',
          birthdate: participant?.birthdate || '',
          linkedinLink: participant?.linkedinLink || '',
          cinPassport: participant?.cinPassport || '',
          profileImage: userData.img || '',
          selectedJEId: participant?.jeId?.toString() || '',
          participantRole: participant?.role || undefined,
          agreedTerms: userData.agreedTerms || false,
        }));

        toast.info('Complétez votre profil');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Continue with empty form if fetch fails
      toast.info('Complétez votre profil');
    }
  };

  const updateData = (data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleFinalSubmit = async () => {
    if (!formData.agreedTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);

    try {
      // Prepare participant data
      const participantData = {
        firstName: formData.firstName || '',
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        participantRole: formData.participantRole,
        sexe: formData.sexe,
        birthdate: formData.birthdate || undefined,
        linkedinLink: formData.linkedinLink || undefined,
        cinPassport: formData.cinPassport || undefined,
        jeCode: formData.jeCode || undefined,
        img: formData.profileImage || undefined,
        agreedTerms: formData.agreedTerms,
      };

      // Complete profile (no tokens returned, user will login after)
      const response = await authService.completeProfile(participantData);

      if (response.success) {
        sessionStorage.clear();
        
        // Show appropriate message based on status
        if (response.status === 'created') {
          toast.success(response.message || 'Vérifiez votre email pour confirmer votre compte.');
        } else if (response.status === 'verified') {
          toast.success(response.message || 'Attendez la validation de votre JE.');
        } else {
          toast.success('Inscription réussie !');
        }
        
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (error: any) {
      console.error('Profile completion failed:', error);
      const errorMsg = error.message || "Erreur lors de la complétion du profil";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-md opacity-75 mt-2">
            Plateforme de recrutement de la Confédération Tunisienne des Junior-Entreprises
          </p>
        </div>

        {/* Complete Profile Form */}
        <div className="w-full max-w-2xl mx-auto">
          <Stepper
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onFinish={handleFinalSubmit}
            steps={STEPS}
          >
            <PersonalInfoStep
              data={formData}
              updateData={updateData}
              loading={loading}
            />
            <JEAssociationStep
              data={formData}
              updateData={updateData}
              onSubmit={handleFinalSubmit}
              loading={loading}
            />
          </Stepper>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-red-500 hover:underline font-semibold">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-red-500 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
