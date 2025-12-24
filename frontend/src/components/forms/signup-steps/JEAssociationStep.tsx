'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ParticipantRole } from '@/types/auth.types';
import { jeService } from '@/lib/services/je.service';
import { SignupFormData } from '@/types/form.types';

interface JEAssociationStepProps {
  data: Pick<SignupFormData, 'selectedJEId' | 'participantRole' | 'jeCode' | 'sexe' | 'agreedTerms'>;
  updateData: (data: Partial<SignupFormData>) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit: () => void;
  loading: boolean;
}

interface JE {
  id: number;
  name: string;
}

export function JEAssociationStep({ data, updateData, loading }: JEAssociationStepProps) {
  const [jes, setJes] = useState<JE[]>([]);
  const [loadingJEs, setLoadingJEs] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<ParticipantRole[]>([]);

  useEffect(() => {
    const fetchJEs = async () => {
      try {
        const response = await jeService.fetchJEsForSignup();
        setJes(response);
      } catch (error) {
        console.error('Error fetching JEs:', error);
      } finally {
        setLoadingJEs(false);
      }
    };

    fetchJEs();
  }, []);

  useEffect(() => {
    if (data.selectedJEId && jes.length > 0) {
      const selectedJE = jes.find(je => je.id.toString() === data.selectedJEId);
      if (selectedJE) {
        updateAvailableRoles(selectedJE.name, data.sexe);
      }
    }
  }, [data.selectedJEId, data.sexe, jes]);

  const updateAvailableRoles = (jeName: string, sexe?: string) => {
    let roles: ParticipantRole[] = [];

    if (jeName === 'Confédération Tunisienne des Junior Entreprises') {
      roles = ['OC', 'CDM', 'BUREAU_NATIONAL'];
      if (sexe === 'M') {
        roles.push('ALUMNUS');
      } else if (sexe === 'F') {
        roles.push('ALUMNA');
      }
    } else {
      roles = ['MEMBRE_JUNIOR', 'MEMBRE_SENIOR', 'RESPONSABLE', 'QUARTET'];
      if (sexe === 'M') {
        roles.push('ALUMNUS');
      } else if (sexe === 'F') {
        roles.push('ALUMNA');
      }
    }

    setAvailableRoles(roles);
  };

  const getRoleLabel = (role: ParticipantRole): string => {
    const labels: Record<ParticipantRole, string> = {
      MEMBRE_JUNIOR: 'Membre Junior',
      MEMBRE_SENIOR: 'Membre Senior',
      RESPONSABLE: 'Responsable',
      QUARTET: 'Quartet',
      CDM: 'CDM',
      ALUMNUS: 'Alumnus',
      ALUMNA: 'Alumna',
      BUREAU_NATIONAL: 'Bureau National',
      INTERNATIONAL_GUEST: 'Invité International',
      OC: 'Organisateur (OC)'
    };
    return labels[role] || role;
  };

  const handleJEChange = (value: string) => {
    updateData({ selectedJEId: value, participantRole: undefined });
    const selectedJE = jes.find(je => je.id.toString() === value);
    if (selectedJE) {
      updateAvailableRoles(selectedJE.name, data.sexe);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">Association à une Junior-Entreprise</h3>
        <p className="text-muted-foreground text-sm mt-1">Rejoignez votre Junior-Entreprise</p>
      </div>

      <div className="space-y-4">
        {/* JE Selection */}
        <div className="space-y-2">
          <Label htmlFor="selectedJE">Sélectionnez votre Junior-Entreprise *</Label>
          {loadingJEs ? (
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Chargement des JEs...</span>
            </div>
          ) : (
            <Select
              value={data.selectedJEId || ''}
              onValueChange={handleJEChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez votre JE" />
              </SelectTrigger>
              <SelectContent>
                {jes.map((je) => (
                  <SelectItem key={je.id} value={je.id.toString()}>
                    {je.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Role Selection */}
        {data.selectedJEId && availableRoles.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="participantRole">Sélectionnez votre rôle *</Label>
            <Select
              value={data.participantRole || ''}
              onValueChange={(value: ParticipantRole) => updateData({ participantRole: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez votre rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* JE Code */}
        {data.selectedJEId && (
          <div className="space-y-2">
            <Label htmlFor="jeCode">Code JE *</Label>
            <Input
              id="jeCode"
              type="text"
              value={data.jeCode || ''}
              onChange={(e) => updateData({ jeCode: e.target.value })}
              placeholder="Entrez le code fourni par votre JE"
              required
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Ce code vous sera fourni par les responsables de votre Junior-Entreprise et sera vérifié
            </p>
          </div>
        )}

        {/* Terms and Conditions */}
        {data.selectedJEId && data.participantRole && data.jeCode && (
          <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
            <input
              id="agreedTerms"
              type="checkbox"
              checked={data.agreedTerms || false}
              onChange={(e) => updateData({ agreedTerms: e.target.checked })}
              disabled={loading}
              className="mt-1 h-4 w-4 rounded accent-primary"
            />
            <Label htmlFor="agreedTerms" className="text-sm leading-relaxed cursor-pointer">
              J'accepte les{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                conditions d'utilisation
              </a>
              {' '}et la{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                politique de confidentialité
              </a>
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
