import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Participant, ParticipantRole } from '@/types/participant.types';

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  sexe?: string;
  phone?: string;
  birthdate?: string;
  linkedinLink?: string;
  cinPassport?: string;
  about?: string;
  role?: ParticipantRole;
}

interface GeneralInformationFormProps {
  profileForm: UseFormReturn<ProfileFormValues>;
  onProfileSubmit: (values: ProfileFormValues) => Promise<void>;
  participant: Participant | null;
}

export const GeneralInformationForm: React.FC<GeneralInformationFormProps> = ({ profileForm, onProfileSubmit, participant }) => {
  const sexe = profileForm.watch('sexe');
  const jeName = participant?.je?.name || '';
  
  // Determine available roles based on JE name
  const getAvailableRoles = () => {
    const isConfederation = jeName === 'Confédération Tunisienne des Junior Entreprises';
    
    if (isConfederation) {
      return [
        ParticipantRole.OC,
        ParticipantRole.CDM,
        ParticipantRole.BUREAU_NATIONAL,
        sexe === 'M' ? ParticipantRole.ALUMNUS : ParticipantRole.ALUMNA,
      ];
    } else {
      return [
        ParticipantRole.MEMBRE_JUNIOR,
        ParticipantRole.MEMBRE_SENIOR,
        sexe === 'M' ? ParticipantRole.ALUMNUS : ParticipantRole.ALUMNA,
        ParticipantRole.RESPONSABLE,
        ParticipantRole.QUARTET,
      ];
    }
  };

  const getRoleLabel = (role: ParticipantRole) => {
    const labels: Record<ParticipantRole, string> = {
      [ParticipantRole.MEMBRE_JUNIOR]: 'Membre Junior',
      [ParticipantRole.MEMBRE_SENIOR]: 'Membre Senior',
      [ParticipantRole.ALUMNUS]: 'Alumnus',
      [ParticipantRole.ALUMNA]: 'Alumna',
      [ParticipantRole.RESPONSABLE]: 'Responsable',
      [ParticipantRole.QUARTET]: 'Responsable Quartet',
      [ParticipantRole.OC]: 'OC',
      [ParticipantRole.CDM]: 'CDM',
      [ParticipantRole.BUREAU_NATIONAL]: 'Bureau National',
      [ParticipantRole.INTERNATIONAL_GUEST]: 'International Guest',
      [ParticipantRole.SPEAKER]: 'Speaker',
    };
    return labels[role] || role;
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
        Informations Générales
      </h3>
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={profileForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Prénom</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                      placeholder="Votre prénom"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Nom</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                      placeholder="Votre nom"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="sexe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Sexe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white">
                        <SelectValue placeholder="Sélectionnez votre sexe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Téléphone</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                      placeholder="Votre numéro de téléphone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Date de Naissance</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="linkedinLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Lien LinkedIn</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                      placeholder="Votre profil LinkedIn"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="cinPassport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">CIN/Passeport</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                      placeholder="Votre numéro CIN ou Passeport"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">À propos de vous</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-500 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                      placeholder="Parlez-nous de vous"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                        <FormField
              control={profileForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Rôle Participant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white">
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getAvailableRoles().map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleLabel(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Junior-Entreprise</FormLabel>
                <FormControl>
                  <Input 
                    value={participant?.je?.name || 'N/A'} 
                    readOnly 
                    className="border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20 dark:text-white"
                  />
                </FormControl>
              </FormItem>
            </div>
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
  );
};