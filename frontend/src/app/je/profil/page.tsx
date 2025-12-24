'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { JeLayout } from '@/components/layout/JELayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { jeService } from '@/lib/services/je.service';
import { toast } from 'sonner';
import { JE } from '@/types/je.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuth } from '@/contexts/auth-context';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('L\'email est invalide'),
});

const passwordFormSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function JEProfilePage() {
  const [je, setJe] = useState<JE | null>(null);
  const [loading, setLoading] = useState(true);

  const { refreshUser } = useAuth();

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
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
        const data = await jeService.getProfile();
        setJe(data);
        profileForm.reset({
          name: data.name || '',
          email: data.user?.email || ''
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
    // The ImageUpload component now handles the full update flow (uploading the file and updating the profile in the backend).
    // This function only needs to update the local state and refresh the global user context.
    try {
      setJe(prevJe => prevJe ? { ...prevJe, user: { ...prevJe.user, img: imageUrl } } : null);
      await refreshUser();
      toast.success('Image de profil mise à jour avec succès');
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('Erreur lors de la mise à jour de l\'image de profil');
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      await jeService.updateProfile(values);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      await jeService.updatePassword({ password: values.password });
      toast.success('Mot de passe mis à jour avec succès');
      passwordForm.reset();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du mot de passe');
    }
  };

  if (loading) {
    return (
      <JeLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </JeLayout>
    );
  }

  return (
    <JeLayout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Main Profile Card */}
          <Card className="bg-white dark:bg-gray-800 backdrop-blur-sm border-red-200 dark:border-red-700 shadow-xl">
            <CardHeader className="text-red-700 rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">
                Informations du Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8 dark:bg-gray-800">
              
              {/* Profile Image Section */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                  Photo de Profil
                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                </h3>
                <div className="flex justify-center">
                  <ImageUpload
                    currentImage={je?.user?.img || ''}
                    onImageUpdate={handleImageUpdate}
                    mode="local"
                    size="lg"
                    fallbackText={je?.name?.charAt(0) || 'JE'}
                    profileUpdateEndpoint="/je/profile"
                  />
                </div>
              </div>

              <div className="border-t border-gray-400 dark:border-gray-100"></div>

              {/* Profile Information Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                  Informations Générales
                </h3>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Nom de la JE</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                                placeholder="Nom de votre Junior-Entreprise"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                {...field} 
                                className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                                placeholder="email@junior-entreprise.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={profileForm.formState.isSubmitting}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white px-8 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
                    >
                      {profileForm.formState.isSubmitting ? 'Mise à jour...' : 'Mettre à jour le profil'}
                    </Button>
                  </form>
                </Form>
              </div>

              <div className="border-t border-gray-400 dark:border-gray-100"></div>

              {/* Password Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                  Sécurité du Compte
                </h3>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Nouveau Mot de Passe</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                                placeholder="Minimum 6 caractères"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Confirmer le Mot de Passe</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                                placeholder="Répétez le mot de passe"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={passwordForm.formState.isSubmitting}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white px-8 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
                    >
                      {passwordForm.formState.isSubmitting ? 'Changement...' : 'Changer le mot de passe'}
                    </Button>
                  </form>
                </Form>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </JeLayout>
  );
}