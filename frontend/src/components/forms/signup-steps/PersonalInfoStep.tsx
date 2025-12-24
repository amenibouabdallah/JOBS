'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { SignupFormData } from '@/types/form.types';

interface PersonalInfoStepProps {
  data: Pick<SignupFormData, 'firstName' | 'lastName' | 'phone' | 'sexe' | 'birthdate' | 'linkedinLink' | 'cinPassport' | 'profileImage'>;
  updateData: (data: Partial<SignupFormData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  loading: boolean;
}

export function PersonalInfoStep({ 
  data, 
  updateData, 
  loading 
}: PersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">Informations personnelles</h3>
        <p className="text-muted-foreground text-sm mt-1">Complétez vos informations personnelles</p>
      </div>

      <div className="space-y-4">
        {/* Profile Image Upload */}
        <div className="flex justify-center">
          <ImageUpload
            currentImage={data.profileImage}
            onImageUpdate={(imageUrl) => updateData({ profileImage: imageUrl })}
            size="lg"
            fallbackText={`${data.firstName?.charAt(0) || ''}${data.lastName?.charAt(0) || ''}`}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              type="text"
              value={data.firstName || ''}
              onChange={(e) => updateData({ firstName: e.target.value })}
              placeholder="Votre prénom"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              type="text"
              value={data.lastName || ''}
              onChange={(e) => updateData({ lastName: e.target.value })}
              placeholder="Votre nom"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone || ''}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder="+216 XX XXX XXX"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexe">Sexe *</Label>
            <Select
              value={data.sexe || ''}
              onValueChange={(value) => updateData({ sexe: value as 'M' | 'F' })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre sexe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthdate">Date de naissance *</Label>
          <Input
            id="birthdate"
            type="date"
            value={data.birthdate || ''}
            onChange={(e) => updateData({ birthdate: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cinPassport">CIN/Passeport *</Label>
          <Input
            id="cinPassport"
            type="text"
            value={data.cinPassport || ''}
            onChange={(e) => updateData({ cinPassport: e.target.value })}
            placeholder="Numéro CIN ou Passeport"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinLink">Profil LinkedIn</Label>
          <Input
            id="linkedinLink"
            type="url"
            value={data.linkedinLink || ''}
            onChange={(e) => updateData({ linkedinLink: e.target.value })}
            placeholder="https://linkedin.com/in/votre-profil"
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            Recommandé pour votre profil professionnel
          </p>
        </div>
      </div>
    </div>
  );
}
