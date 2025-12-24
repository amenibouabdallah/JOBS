'use client';

import { useState } from 'react';
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
import { CreateJEFormData } from '@/types/je.types';

interface CreateJEModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJEFormData) => Promise<void>;
  loading: boolean;
}

export function CreateJEModal({ isOpen, onClose, onSubmit, loading }: CreateJEModalProps) {
  const [formData, setFormData] = useState<CreateJEFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Le nom et l\'email sont requis');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Créer une nouvelle JE</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ajoutez une nouvelle Junior-Entreprise au système
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Nom de la JE *
            </Label>
            <Input
              id="name"
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
            <Label htmlFor="email" className="text-foreground">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@jeesprit.tn"
              required
              disabled={loading}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">
              Téléphone
            </Label>
            <Input
              id="phone"
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
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
