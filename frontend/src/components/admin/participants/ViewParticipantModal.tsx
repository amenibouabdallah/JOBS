
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Participant } from '@/types/participant.types';

interface ViewParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
}

export function ViewParticipantModal({ isOpen, onClose, participant }: ViewParticipantModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>View Participant</DialogTitle>
          <DialogDescription>
            Participant details
          </DialogDescription>
        </DialogHeader>
        {participant && (
          <div className="space-y-4">
            <p><strong>Name:</strong> {`${participant.firstName} ${participant.lastName}`}</p>
            <p><strong>Email:</strong> {participant.user.email}</p>
            <p><strong>JE:</strong> {participant.je?.name || 'N/A'}</p>
            <p><strong>Status:</strong> {participant.user.status}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
