
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { participantService } from '@/lib/services/participant.service';
import { jeService } from '@/lib/services/je.service';
import { Participant, CreateParticipantFormData, UpdateParticipantFormData } from '@/types/participant.types';
import { JE } from '@/types/je.types';
import { CreateParticipantModal } from '@/components/admin/participants/CreateParticipantModal';
import { EditParticipantModal } from '@/components/admin/participants/EditParticipantModal';
import { ViewParticipantModal } from '@/components/admin/participants/ViewParticipantModal';
import { ParticipantList } from '@/components/admin/participants/ParticipantList';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { UsersIcon, CreditCardIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function ParticipantManagementPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [jes, setJes] = useState<JE[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJeId, setSelectedJeId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/participants');
        return;
      }

      if (user?.role !== 'ADMIN') {
        router.push('/login?error=unauthorized');
        return;
      }

      fetchParticipants();
      fetchJEs();
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchJEs = async () => {
    try {
      const data = await jeService.fetchJEs();
      setJes(data);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des JEs');
    }
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await participantService.getAllParticipants();
      setParticipants(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des participants');
      toast.error('Erreur lors du chargement des participants');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      const matchesSearch = 
        (participant.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (participant.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (participant.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesJe = selectedJeId === 'all' || participant.jeId?.toString() === selectedJeId;
      
      const matchesStatus = selectedStatus === 'all' || participant.user.status === selectedStatus;

      return matchesSearch && matchesJe && matchesStatus;
    });
  }, [participants, searchTerm, selectedJeId, selectedStatus]);

  const stats = useMemo(() => {
    const totalParticipants = participants.length;
    const paidParticipants = participants.filter(p => p.paymentStatus === 'paid').length;
    const jesPresent = new Set(participants.map(p => p.jeId).filter(Boolean)).size;

    return [
      {
        title: "Total Participants",
        value: totalParticipants.toString(),
        description: "Participants inscrits",
        icon: UsersIcon,
        color: "text-blue-500"
      },
      {
        title: "Participants Payés",
        value: paidParticipants.toString(),
        description: "Paiement confirmé",
        icon: CreditCardIcon,
        color: "text-green-500"
      },
      {
        title: "JEs Présentes",
        value: jesPresent.toString(),
        description: "JEs représentées",
        icon: BuildingOfficeIcon,
        color: "text-purple-500"
      }
    ];
  }, [participants]);

  const handleCreateParticipant = async (formData: CreateParticipantFormData) => {
    try {
      setActionLoading(true);
      const newParticipant = await participantService.createParticipant(formData);
      setParticipants(prev => [...prev, newParticipant]);
      setSuccess('Participant créé avec succès');
      toast.success('Participant créé avec succès');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateParticipant = async (formData: UpdateParticipantFormData) => {
    if (!currentParticipant) return;

    try {
      setActionLoading(true);
      const updatedParticipant = await participantService.updateParticipant(currentParticipant.id, formData);
      setParticipants(prev => prev.map(p => p.id === currentParticipant.id ? updatedParticipant : p));
      setSuccess('Participant modifié avec succès');
      toast.success('Participant modifié avec succès');
      setIsEditModalOpen(false);
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la modification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParticipant = async (participantId: number, participantName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le participant \"${participantName}\"?`)) return;

    try {
      setActionLoading(true);
      await participantService.deleteParticipant(participantId);
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      setSuccess('Participant supprimé avec succès');
      toast.success('Participant supprimé avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      toast.error('Erreur lors de la suppression');
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

  const handleTogglePayment = async (participantId: number, paid: boolean) => {
    try {
      setActionLoading(true);
      await participantService.toggleParticipantPayment(participantId, paid);
      setParticipants(prev =>
        prev.map(p => {
          if (p.id === participantId) {
            const newPayDate = paid ? new Date() : null;
            const newFirstPayDate = p.firstPayDate; // Updated: firstPayDate remains unchanged
            let newPaymentStatus: string;

            if (newPayDate) {
              newPaymentStatus = 'paid';
            } else if (newFirstPayDate) {
              newPaymentStatus = 'first part paid';
            } else {
              newPaymentStatus = 'unpaid';
            }

            return {
              ...p,
              payDate: newPayDate,
              firstPayDate: newFirstPayDate,
              paymentStatus: newPaymentStatus,
            };
          }
          return p;
        })
      );
      toast.success(`Payment status updated to ${paid ? 'paid' : 'unpaid'}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status');
      toast.error('Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Participants</h1>
            <p className="text-muted-foreground">
              Gérez les participants inscrits à l'événement
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Ajouter un Participant
            </Button>
          </div>
        </div>

        <DashboardStats stats={stats} />

        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-card p-4 rounded-lg border border-border">
          <div className="w-full md:w-1/3 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par nom, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <Select value={selectedJeId} onValueChange={setSelectedJeId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par JE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les JEs</SelectItem>
                {jes.map((je) => (
                  <SelectItem key={je.id} value={je.id.toString()}>
                    {je.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="CREATED">Créé</SelectItem>
                <SelectItem value="VERIFIED">Vérifié</SelectItem>
                <SelectItem value="APPROVED">Approuvé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedJeId('all');
              setSelectedStatus('all');
            }}
            className="w-full md:w-auto"
          >
            Réinitialiser
          </Button>
        </div>

        <ParticipantList
          participants={filteredParticipants}
          loading={loading}
          handleViewParticipant={handleViewParticipant}
          handleEditParticipant={handleEditParticipant}
          handleDeleteParticipant={handleDeleteParticipant}
          handleTogglePayment={handleTogglePayment}
        />

        {/* Modals */}
        <CreateParticipantModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateParticipant}
          loading={actionLoading}
          jes={jes}
        />

        <EditParticipantModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateParticipant}
          loading={actionLoading}
          participant={currentParticipant}
        />

        <ViewParticipantModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          participant={currentParticipant}
        />
      </div>
    </AdminLayout>
  );
}
