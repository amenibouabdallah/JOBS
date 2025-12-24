import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UpdateParticipantFormData, Participant } from '@/types/participant.types';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface EditParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateParticipantFormData) => void;
  loading: boolean;
  participant: Participant | null;
}

export function EditParticipantModal({ isOpen, onClose, onSubmit, loading, participant }: EditParticipantModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateParticipantFormData>();

  useEffect(() => {
    if (participant) {
      reset({
        firstName: participant.firstName || undefined,
        lastName: participant.lastName || undefined,
      });
    }
  }, [participant, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Participant</DialogTitle>
          <DialogDescription>
            Update participant information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" {...register('firstName', { required: 'Prénom est requis' })} />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" {...register('lastName', { required: 'Nom est requis' })} />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
