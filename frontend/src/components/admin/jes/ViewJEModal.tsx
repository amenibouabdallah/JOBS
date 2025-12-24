'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JE } from '@/types/je.types';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { Badge } from 'lucide-react';

interface ViewJEModalProps {
  isOpen: boolean;
  onClose: () => void;
  je: JE | null;
  onSendCredentialsEmail: (jeId: number) => Promise<void>;
  loading: boolean;
}

export function ViewJEModal({
  isOpen,
  onClose,
  je,
  onSendCredentialsEmail,
  loading
}: ViewJEModalProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSendCredentialsEmail = async () => {
    if (!je) return;
    
    setIsSendingEmail(true);
    try {
      await onSendCredentialsEmail(je.id);
      toast.success('Email envoyé avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Détails de la JE</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informations détaillées de la Junior-Entreprise
          </DialogDescription>
        </DialogHeader>

        {je && (
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom de la JE</p>
                <p className="text-foreground font-semibold">{je.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{je.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Code</p>
                <p className="text-foreground font-mono bg-muted px-2 py-1 rounded">{je.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                <p className="text-foreground">{je.phone || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut</p>
                <p className="text-foreground">
                  <span
                    className={
                      je.user.status === 'APPROVED' 
                        ? 'bg-primary/10 text-primary px-2 py-1 rounded'
                        : 'bg-warning/10 text-warning px-2 py-1 rounded'
                    }
                  >
                    {je.user.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                <p className="text-foreground">{formatDate(je.user.createdAt)}</p>
              </div>
            </div>

            {/* Credentials Management */}
            <div className="border-t border-border pt-4">
              <h4 className="text-lg font-semibold text-foreground mb-3">Gestion des identifiants</h4>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleSendCredentialsEmail}
                  disabled={isSendingEmail || loading}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {isSendingEmail ? 'Envoi...' : 'Envoyer par email'}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={onClose}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
