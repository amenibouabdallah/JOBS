'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JE, UpdateJEFormData } from '@/types/je.types';

interface EditJEModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateJEFormData) => Promise<void>;
  loading: boolean;
  je: JE | null;
}

export function EditJEModal({ isOpen, onClose, onSubmit, loading, je }: EditJEModalProps) {
  const [formData, setFormData] = useState<UpdateJEFormData>({
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (je) {
      setFormData({
        name: je.name,
        phone: je.phone || '',
      });
    }
  }, [je]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name?.trim()) {
      setError('Le nom est requis');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', phone: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Modifier la JE</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modifiez les informations de la Junior-Entreprise
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-foreground">
              Nom de la JE *
            </Label>
            <Input
              id="edit-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: JE ESPRIT"
              required
              disabled={loading}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-foreground">
              Email
            </Label>
            <Input
              id="edit-email"
              type="email"
              value={je?.user?.email || ''}
              disabled
              className="bg-muted/20 border-border text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="text-foreground">
              Téléphone
            </Label>
            <Input
              id="edit-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+216 XX XXX XXX"
              disabled={loading}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="bg-secondary border-border text-secondary-foreground hover:bg-secondary/80"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
            >
              {loading ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
