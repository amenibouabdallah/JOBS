
import { Participant } from '@/types/participant.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiEdit2, FiEye, FiCheck } from 'react-icons/fi';

interface ParticipantListProps {
  participants: Participant[];
  loading: boolean;
  handleApproveParticipant: (participantId: number) => void;
  handleEditParticipant: (participant: Participant) => void;
  handleViewParticipant: (participant: Participant) => void;
}

export function ParticipantList({ 
  participants, 
  loading, 
  handleApproveParticipant,
  handleEditParticipant,
  handleViewParticipant
}: ParticipantListProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucun participant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun participant n'est encore inscrit dans votre JE.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (participant: Participant) => {
    if (participant.user.status === 'APPROVED') { // Check user status first for APPROVED
      return <Badge variant="success">Approuvé</Badge>;
    }
    if (participant.user.status === 'VERIFIED') { // Then check for VERIFIED
      return <Badge variant="warning">En attente d'approbation</Badge>;
    }
    if (participant.payDate) { // Payment status is separate from approval status
      return <Badge variant="info">Payé</Badge>;
    }
    return <Badge variant="destructive">Non vérifié</Badge>;
  };

  const getPaymentBadge = (participant: Participant) => {
    if (participant.payDate) {
      return <Badge variant="default" className="bg-green-600">Payé</Badge>;
    } else {
      return <Badge variant="outline">Non payé</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {participant.firstName && participant.lastName
                        ? `${participant.firstName} ${participant.lastName}`
                        : 'Nom non renseigné'}
                    </div>
                    {participant.phone && (
                      <div className="text-sm text-muted-foreground">{participant.phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{participant.user?.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {participant.role?.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(participant)}</TableCell>
                <TableCell>{getPaymentBadge(participant)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewParticipant(participant)}
                      title="Voir les détails"
                    >
                      <FiEye className="h-4 w-4 text-yellow-800 dark:text-yellow-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditParticipant(participant)}
                      title="Modifier"
                    >
                      <FiEdit2 className="h-4 w-4 text-blue-800 dark:text-blue-400" />
                    </Button>
                    {!participant.approvedAt && !participant.payDate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveParticipant(participant.id)}
                        title="Approuver"
                        className="text-green-600 hover:text-green-700"
                      >
                        <FiCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}