'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ParticipantLayout } from '@/components/layout/ParticipantLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { participantService } from '@/lib/services/participant.service';
import { toast } from 'sonner';
import { Participant, ParticipantRole } from '@/types/participant.types';
import { ImageUpload } from '@/components/ui/image-upload';
import { ProfileImageSection } from '@/components/participant/ProfileImageSection';
import { GeneralInformationForm, ProfileFormValues } from '@/components/participant/GeneralInformationForm';
import { AccountSecurityForm, PasswordFormValues } from '@/components/participant/AccountSecurityForm';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  sexe: z.string().optional(),
  phone: z.string().optional(),
  birthdate: z.string().optional(),
  linkedinLink: z.string().optional(),
  cinPassport: z.string().optional(),
  about: z.string().optional(),
  role: z.nativeEnum(ParticipantRole).optional(),
}) satisfies z.ZodType<ProfileFormValues>;

const passwordFormSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
}) satisfies z.ZodType<PasswordFormValues>;

export default function ParticipantProfilePage() {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      sexe: '',
      phone: '',
      birthdate: '',
      linkedinLink: '',
      cinPassport: '',
      about: '',
      role: undefined,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await participantService.getParticipantProfile();
        setParticipant(data);
        profileForm.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          sexe: data.sexe || '',
          phone: data.phone || '',
          birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : '',
          linkedinLink: data.linkedinLink || '',
          cinPassport: data.cinPassport || '',
          about: data.about || '',
          role: data.role || undefined,
        });
      } catch (error) {
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileForm]);

  const handleImageUpdate = async (imageUrl: string) => {
    // The ImageUpload component with profileUpdateEndpoint handles the full update flow
    // This function only needs to update the local state
    try {
      setParticipant(prevParticipant => 
        prevParticipant ? { ...prevParticipant, user: { ...prevParticipant.user, img: imageUrl } } : null
      );
      toast.success('Image de profil mise à jour avec succès');
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('Erreur lors de la mise à jour de l\'image de profil');
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      // Convert birthdate string to Date if present
      const updateData = {
        ...values,
        birthdate: values.birthdate ? new Date(values.birthdate) : undefined,
      };
      await participantService.updateParticipantProfile(updateData);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      await participantService.updatePassword({ password: values.password });
      toast.success('Mot de passe mis à jour avec succès');
      passwordForm.reset();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du mot de passe');
    }
  };

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Main Profile Card */}
          <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border-red-200 dark:border-red-700 shadow-xl">
            <CardHeader className="dark:text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">
                Informations du Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8 dark:bg-gray-800">
              
              {/* Profile Image Section */}
              <ProfileImageSection participant={participant} handleImageUpdate={handleImageUpdate} />

              <div className="border-t border-gray-400 dark:border-gray-200"></div>

              {/* Profile Information Section */}
              <GeneralInformationForm profileForm={profileForm} onProfileSubmit={onProfileSubmit} participant={participant} />

              <div className="border-t border-gray-400 dark:border-gray-200"></div>

              {/* Password Section */}
              <AccountSecurityForm passwordForm={passwordForm} onPasswordSubmit={onPasswordSubmit} />

            </CardContent>
          </Card>
        </div>
      </div>
    </ParticipantLayout>
  );
}