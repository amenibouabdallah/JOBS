'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { jeService } from '@/lib/services/je.service';
import { Participant } from '@/types/participant.types';

interface CreatePaymentSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onSuccess: () => void;
}

export function CreatePaymentSheetModal({
  isOpen,
  onClose,
  participants,
  onSuccess,
}: CreatePaymentSheetModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setNotes('');
      setSelectedParticipants([]);
    }
  }, [isOpen]);

  // Filter out participants who have already paid or aren't approved
  const eligibleParticipants = participants.filter(
    p => p.approvedAt && !p.payDate
  );

  const handleParticipantToggle = (participantId: number) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === eligibleParticipants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(eligibleParticipants.map(p => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Veuillez saisir un titre');
      return;
    }

    if (selectedParticipants.length === 0) {
      toast.error('Veuillez sélectionner au moins un participant');
      return;
    }

    setLoading(true);
    try {
      // Create the payment sheet with selected participants
      const response = await jeService.createPaymentSheet({
        title: title.trim(),
        participantIds: selectedParticipants,
        notes: notes.trim() || undefined,
      });
      
      toast.success(`Liste de paiement créée avec ${selectedParticipants.length} participants`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la liste');
    } finally {
      setLoading(false);
    }
  };

  const getParticipantDisplayName = (participant: Participant) => {
    if (participant.firstName && participant.lastName) {
      return `${participant.firstName} ${participant.lastName}`;
    }
    return participant.user?.email || 'Nom non défini';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Créer une Liste de Paiement
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les participants qui ont effectué leur paiement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la liste</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Paiements semaine du 7 août 2025"
              required
            />
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations supplémentaires..."
              rows={3}
            />
          </div>

          {/* Participants Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Participants ({eligibleParticipants.length} éligibles)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedParticipants.length === eligibleParticipants.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
            </div>

            {eligibleParticipants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun participant éligible</p>
                <p className="text-sm">Les participants doivent être approuvés et ne pas avoir encore payé</p>
              </div>
            ) : (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b">
                  <div className="text-sm text-gray-600">
                    {selectedParticipants.length} participant(s) sélectionné(s)
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  {eligibleParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedParticipants.includes(participant.id)}
                        onCheckedChange={() => handleParticipantToggle(participant.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {getParticipantDisplayName(participant)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {participant.user?.email}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {participant.role}
                        </Badge>
                        {participant.approvedAt && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Approuvé
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedParticipants.length === 0}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer la Liste
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
