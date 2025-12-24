import React, { useState, useEffect } from 'react';
import { Participant, UpdateParticipantFormData } from '@/types/participant.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EditParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: UpdateParticipantFormData) => Promise<void>;
  loading: boolean;
  participant: Participant | null;
}

export function EditParticipantModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  participant,
}: EditParticipantModalProps) {
  const [formData, setFormData] = useState<UpdateParticipantFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    sexe: undefined,
    about: '',
    linkedinLink: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (participant) {
      setFormData({
        firstName: participant.firstName || '',
        lastName: participant.lastName || '',
        phone: participant.phone || '',
        sexe: (participant.sexe as 'M' | 'F') || undefined,
        about: participant.about || '',
        linkedinLink: participant.linkedinLink || '',
      });
    }
  }, [participant]);

  const handleInputChange = (field: keyof UpdateParticipantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    if (formData.linkedinLink && !formData.linkedinLink.includes('linkedin.com')) {
      newErrors.linkedinLink = 'Lien LinkedIn invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification');
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      sexe: undefined,
      about: '',
      linkedinLink: '',
    });
    setErrors({});
    onClose();
  };

  if (!participant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le Participant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Prénom"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Nom"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexe">Sexe</Label>
              <Select
                value={formData.sexe}
                onValueChange={(value) => handleInputChange('sexe', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinLink">Profil LinkedIn</Label>
            <Input
              id="linkedinLink"
              value={formData.linkedinLink}
              onChange={(e) => handleInputChange('linkedinLink', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className={errors.linkedinLink ? 'border-red-500' : ''}
            />
            {errors.linkedinLink && (
              <p className="text-sm text-red-500">{errors.linkedinLink}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">À propos</Label>
            <Textarea
              id="about"
              value={formData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              placeholder="Présentation personnelle..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Modification...' : 'Modifier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
