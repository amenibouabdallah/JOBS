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
import { CreateParticipantFormData } from '@/types/participant.types';
import { JE } from '@/types/je.types';
import { useForm } from 'react-hook-form';

interface CreateParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateParticipantFormData) => void;
  loading: boolean;
  jes: JE[];
}

export function CreateParticipantModal({ isOpen, onClose, onSubmit, loading, jes }: CreateParticipantModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateParticipantFormData>();

  const handleFormSubmit = (data: CreateParticipantFormData) => {
    onSubmit({
      ...data,
      jeId: Number(data.jeId),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Participant</DialogTitle>
          <DialogDescription>
            Add a new participant to the system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName', { required: 'First name is required' })} />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName', { required: 'Last name is required' })} />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password', { required: 'Password is required' })} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="jeId">Junior-Entreprise</Label>
              <select id="jeId" {...register('jeId', { required: 'JE is required' })} className="border rounded bg-background px-2 w-full h-10">
                <option value="">Select a JE</option>
                {jes?.map(je => (
                  <option key={je.id} value={je.id}>{je.name}</option>
                ))}
              </select>
              {errors.jeId && <p className="text-red-500 text-sm">{errors.jeId.message}</p>}
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}