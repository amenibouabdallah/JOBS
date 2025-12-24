
import { Participant } from '@/types/participant.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FiEdit, FiTrash2, FiEye, FiDollarSign, FiX } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';

interface ParticipantListProps {
  participants: Participant[];
  loading: boolean;
  handleViewParticipant: (participant: Participant) => void;
  handleEditParticipant: (participant: Participant) => void;
  handleDeleteParticipant: (participantId: number, participantName: string) => void;
  handleTogglePayment: (participantId: number, paid: boolean) => void;
}

export function ParticipantList({ participants, loading, handleViewParticipant, handleEditParticipant, handleDeleteParticipant, handleTogglePayment }: ParticipantListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>JE</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>{`${participant.firstName} ${participant.lastName}`}</TableCell>
            <TableCell>{participant.user.email}</TableCell>
            <TableCell>{participant.je?.name || 'N/A'}</TableCell>
            <TableCell>
              <Badge>{participant.user.status}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={
                participant.paymentStatus === "paid" ? "default" :
                participant.paymentStatus === "first part paid" ? "warning" :
                "secondary"
              }>
                {participant.paymentStatus === "paid" ? "Paid" :
                 participant.paymentStatus === "first part paid" ? "First Part Paid" :
                 "Unpaid"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => handleViewParticipant(participant)}>
                <FiEye />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEditParticipant(participant)}>
                <FiEdit />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleTogglePayment(participant.id, !participant.payDate)}
                title={participant.payDate ? "Mark as unpaid" : "Mark as paid"}
                className={participant.payDate ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
              >
                {participant.payDate ? <FiX /> : <FiDollarSign />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteParticipant(participant.id, `${participant.firstName} ${participant.lastName}`)}>
                <FiTrash2 />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
