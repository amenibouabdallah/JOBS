'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { JeLayout } from '@/components/layout/JELayout';
import { jeService } from '@/lib/services/je.service';
import { Participant, UpdateParticipantFormData } from '@/types/participant.types';
import { ParticipantList } from '@/components/je/ParticipantList';
import { ViewParticipantModal } from '@/components/je/ViewParticipantModal';
import { EditParticipantModal } from '@/components/je/EditParticipantModal';
import { CreatePaymentSheetModal } from '@/components/je/CreatePaymentSheetModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiUpload, FiDownload } from 'react-icons/fi';
import { toast } from 'sonner';

export default function ParticipantManagementPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePaymentSheetModalOpen, setIsCreatePaymentSheetModalOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/je/participants');
        return;
      }

      if (user?.role !== 'JE') {
        router.push('/login?error=unauthorized');
        return;
      }

      fetchParticipants();
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await jeService.getParticipants();
      setParticipants(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des participants');
      toast.error('Erreur lors du chargement des participants');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveParticipant = async (participantId: number) => {
    try {
      setActionLoading(true);
      await jeService.approveParticipant(participantId);
      setParticipants(prev =>
        prev.map(p => (p.id === participantId ? { ...p, approvedAt: new Date() } : p))
      );
      toast.success('Participant approuve avec succes');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de approbation');
      toast.error('Erreur lors de approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditParticipant = (participant: Participant) => {
    setCurrentParticipant(participant);
    setIsEditModalOpen(true);
  };

  const handleViewParticipant = (participant: Participant) => {
    setCurrentParticipant(participant);
    setIsViewModalOpen(true);
  };

  const handleUpdateParticipant = async (formData: UpdateParticipantFormData) => {
    if (!currentParticipant) return;

    try {
      setActionLoading(true);
      const updatedParticipant = await jeService.updateParticipant(currentParticipant.id, formData);
      setParticipants(prev => prev.map(p => p.id === currentParticipant.id ? updatedParticipant : p));
      toast.success('Participant modifie avec succes');
      setIsEditModalOpen(false);
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la modification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadPaymentSheet = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setActionLoading(true);
      const result = await jeService.uploadPaymentSheetFile(file);
      toast.success('Fichier de paiement telecharge avec succes');
      fetchParticipants(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du telechargement');
    } finally {
      setActionLoading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleCreatePaymentList = async () => {
    setIsCreatePaymentSheetModalOpen(true);
  };

  // Statistics
  const stats = {
    total: participants.length,
    approved: participants.filter(p => p.approvedAt).length,
    pending: participants.filter(p => !p.approvedAt && p.user?.status === 'VERIFIED').length,
    paid: participants.filter(p => p.payDate).length,
  };

  if (isLoading) {
    return (
      <JeLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </JeLayout>
    );
  }

  return (
    <JeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Participants</h1>
            <p className="text-muted-foreground">
              Gerez les participants de votre JE
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={handleCreatePaymentList}
              className='bg-red-700 dark:bg-red-500'
            >
              <FiUpload className="mr-2 h-4 w-4" />
              Créer une liste de Paiement
            </Button>
            <label htmlFor="payment-sheet-upload">
            </label>
            <input
              id="payment-sheet-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUploadPaymentSheet}
              className="hidden"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approuves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Payé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
            </CardContent>
          </Card>
        </div>

        <ParticipantList
          participants={participants}
          loading={loading}
          handleApproveParticipant={handleApproveParticipant}
          handleEditParticipant={handleEditParticipant}
          handleViewParticipant={handleViewParticipant}
        />

        {/* Modals */}
        <ViewParticipantModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          participant={currentParticipant}
        />

        <EditParticipantModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateParticipant}
          loading={actionLoading}
          participant={currentParticipant}
        />

        <CreatePaymentSheetModal
          isOpen={isCreatePaymentSheetModalOpen}
          onClose={() => setIsCreatePaymentSheetModalOpen(false)}
          participants={participants}
          onSuccess={fetchParticipants}
        />
      </div>
    </JeLayout>
  );
}
