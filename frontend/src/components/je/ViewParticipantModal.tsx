import React from 'react';
import { Participant } from '@/types/participant.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ViewParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
}

export function ViewParticipantModal({
  isOpen,
  onClose,
  participant,
}: ViewParticipantModalProps) {
  if (!participant) return null;

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Non renseigné';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (participant: Participant) => {
    if (participant.approvedAt) {
      return <Badge variant="default" className="bg-green-600">Approuvé</Badge>;
    } else if (participant.user?.status === 'VERIFIED') {
      return <Badge variant="secondary">En attente</Badge>;
    } else {
      return <Badge variant="destructive">Non vérifié</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du Participant</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informations Personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                <p className="mt-1">{participant.firstName || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                <p className="mt-1">{participant.lastName || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1">{participant.user?.email || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                <p className="mt-1">{participant.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sexe</label>
                <p className="mt-1">{participant.sexe || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                <p className="mt-1">{formatDate(participant.birthdate)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role and Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Rôle et Statut</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                <p className="mt-1">
                  <Badge variant="outline">
                    {participant.role?.replace('_', ' ') || 'Non défini'}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Statut</label>
                <p className="mt-1">{getStatusBadge(participant)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date d'approbation</label>
                <p className="mt-1">{formatDate(participant.approvedAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Niveau de confidentialité</label>
                <p className="mt-1">{participant.privacy || 0}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informations de Paiement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Statut de paiement</label>
                <p className="mt-1">
                  {participant.payDate ? (
                    <Badge variant="default" className="bg-green-600">Payé</Badge>
                  ) : (
                    <Badge variant="outline">Non payé</Badge>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date de paiement</label>
                <p className="mt-1">{formatDate(participant.payDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Premier paiement</label>
                <p className="mt-1">{formatDate(participant.firstPayDate)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informations Complémentaires</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                <p className="mt-1">
                  {participant.linkedinLink ? (
                    <a 
                      href={participant.linkedinLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {participant.linkedinLink}
                    </a>
                  ) : (
                    'Non renseigné'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CIN/Passeport</label>
                <p className="mt-1">{participant.cinPassport || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Lieu</label>
                <p className="mt-1">{participant.placeName || 'Non renseigné'}</p>
              </div>
              {participant.about && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">À propos</label>
                  <p className="mt-1 text-sm bg-muted p-3 rounded-md">{participant.about}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
