'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthStep } from './signup-steps/AuthStep';
import { PersonalInfoStep } from './signup-steps/PersonalInfoStep';
import { JEAssociationStep } from './signup-steps/JEAssociationStep';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/lib/services/auth.service';
import { toast } from 'sonner';
import { RegisterDto } from '@/types/auth.types';
import { Stepper } from '@/components/Stepper';
import { SignupFormData, StepDefinition } from '@/types/form.types';

const STEPS: StepDefinition[] = [
  { id: 1, title: 'Authentification', description: 'Email et mot de passe' },
  { id: 2, title: 'Informations personnelles', description: 'Vos données personnelles' },
  { id: 3, title: 'Association JE', description: 'Rejoindre votre Junior-Entreprise' },
];

export default function SignUpForm() {
  const router = useRouter();
  const { isLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [googleUserId, setGoogleUserId] = useState<number | null>(null);
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
    const urlParams = new URLSearchParams(window.location.search);
    const googleDataParam = urlParams.get('google_data');
    
    if (googleDataParam) {
      try {
        const googleData = JSON.parse(decodeURIComponent(googleDataParam));
        
        setFormData(prev => ({
          ...prev,
          email: googleData.email || '',
          firstName: googleData.firstName || '',
          lastName: googleData.lastName || '',
        }));
        
        setIsGoogleSignup(true);
        setGoogleUserId(googleData.userId);
        setCurrentStep(1); // Start at step 2 (index 1)
        
        sessionStorage.setItem('isGoogleSignup', 'true');
        sessionStorage.setItem('googleUserId', googleData.userId?.toString() || '');
        sessionStorage.setItem('googleId', googleData.googleId || '');
        sessionStorage.setItem('googleImg', googleData.img || '');
        
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        if (googleData.needsCompletion) {
          toast.success('Compte Google trouvé ! Complétez votre inscription.');
        } else {
          toast.success('Données Google récupérées ! Complétez votre inscription.');
        }
      } catch (error) {
        console.error('Error parsing Google data:', error);
        toast.error('Erreur lors de la récupération des données Google');
      }
    } else {
      const savedGoogleSignup = sessionStorage.getItem('isGoogleSignup');
      const savedGoogleUserId = sessionStorage.getItem('googleUserId');
      
      if (savedGoogleSignup === 'true') {
        setIsGoogleSignup(true);
      }
      
      if (savedGoogleUserId) {
        setGoogleUserId(parseInt(savedGoogleUserId));
      }
    }
  }, []);

  const updateData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleFinalSubmit = async () => {
    if (!formData.agreedTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);

    try {
      if (isGoogleSignup && googleUserId) {
        const participantData = {
          userId: googleUserId,
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
        };

        const response = await authService.updateProfile(participantData);
        
        if (response) {
          sessionStorage.clear();
          toast.success('Inscription réussie ! Redirection vers votre tableau de bord...');
          setTimeout(() => router.push('/participant'), 2000);
        }
      } else {
        const isNewGoogleSignup = isGoogleSignup && !googleUserId;
        const googleId = sessionStorage.getItem('googleId') || '';
        const googleImg = sessionStorage.getItem('googleImg') || '';
        
        const registrationData: RegisterDto = {
          email: formData.email.trim().toLowerCase(),
          password: isGoogleSignup ? undefined : formData.password,
          role: 'PARTICIPANT',
          firstName: formData.firstName?.trim() || '',
          lastName: formData.lastName.trim(),
          phone: formData.phone || undefined,
          participantRole: formData.participantRole,
          sexe: formData.sexe,
          birthdate: formData.birthdate || undefined,
          linkedinLink: formData.linkedinLink || undefined,
          cinPassport: formData.cinPassport || undefined,
          jeCode: formData.jeCode || undefined,
          isOAuth: isNewGoogleSignup,
          googleId: isNewGoogleSignup ? googleId : undefined,
          img: formData.profileImage || (isNewGoogleSignup ? googleImg : undefined),
        };

        const response = await authService.register(registrationData);
        
        if (response) {
          sessionStorage.clear();
          if (isNewGoogleSignup) {
            toast.success('Inscription Google réussie ! Redirection vers votre tableau de bord...');
            setTimeout(() => router.push('/dashboard'), 2000);
          } else {
            toast.success('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
            setTimeout(() => router.push('/login?message=' + encodeURIComponent('Inscription réussie ! Vérifiez votre email.')), 2000);
          }
        }
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMsg = error.message || 'Erreur lors de l\'inscription';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isFormDisabled = isLoading || loading;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Stepper 
        currentStep={currentStep} 
        onStepChange={setCurrentStep} 
        onFinish={handleFinalSubmit} 
        steps={STEPS}
      >
        <AuthStep
          data={formData}
          updateData={updateData}
          loading={isFormDisabled}
        />
        <PersonalInfoStep
          data={formData}
          updateData={updateData}
          loading={isFormDisabled}
        />
        <JEAssociationStep
          data={formData}
          updateData={updateData}
          onSubmit={handleFinalSubmit}
          loading={isFormDisabled}
        />
      </Stepper>
    </div>
  );
}