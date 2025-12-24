import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export interface PasswordFormValues {
  password: string;
  confirmPassword: string;
}

interface AccountSecurityFormProps {
  passwordForm: UseFormReturn<PasswordFormValues>;
  onPasswordSubmit: (values: PasswordFormValues) => Promise<void>;
}

export const AccountSecurityForm: React.FC<AccountSecurityFormProps> = ({ passwordForm, onPasswordSubmit }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
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
  );
};
