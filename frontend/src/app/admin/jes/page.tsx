'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiTerminal, FiMail } from 'react-icons/fi';
import { jeService } from '@/lib/services/je.service';
import { JE, CreateJEFormData, UpdateJEFormData } from '@/types/je.types';
import { CreateJEModal } from '@/components/admin/jes/CreateJEModal';
import { EditJEModal } from '@/components/admin/jes/EditJEModal';
import { ViewJEModal } from '@/components/admin/jes/ViewJEModal';
import { toast } from 'sonner';
import { JEList } from '@/components/admin/jes/JEList';

export default function JEManagementPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jes, setJes] = useState<JE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJE, setCurrentJE] = useState<JE | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/jes');
        return;
      }
      
      if (user?.role !== 'ADMIN') {
        router.push('/login?error=unauthorized');
        return;
      }

      fetchJEs();
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchJEs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await jeService.fetchJEs();
      setJes(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des JEs');
      toast.error('Erreur lors du chargement des JEs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJE = async (formData: CreateJEFormData) => {
    try {
      setActionLoading(true);
      const newJE = await jeService.createJE(formData);
      setJes(prev => [...prev, newJE]);
      setSuccess('JE créée avec succès');
      toast.success('JE créée avec succès');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateJE = async (formData: UpdateJEFormData) => {
    if (!currentJE) return;
    
    try {
      setActionLoading(true);
      const updatedJE = await jeService.updateJE(currentJE.id, formData);
      setJes(prev => prev.map(je => je.id === currentJE.id ? updatedJE : je));
      setSuccess('JE modifiée avec succès');
      toast.success('JE modifiée avec succès');
      setIsEditModalOpen(false);
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la modification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJE = async (jeId: number, jeName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la JE "${jeName}" ?`)) return;
    
    try {
      setActionLoading(true);
      await jeService.deleteJE(jeId);
      setJes(prev => prev.filter(je => je.id !== jeId));
      setSuccess('JE supprimée avec succès');
      toast.success('JE supprimée avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      toast.error('Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCredentialsEmail = async (jeId: number) => {
    try {
      setActionLoading(true);
      await jeService.sendJECredentialsEmail(jeId);
      toast.success(`Email de connexion envoyé avec succès`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateJEsFromScript = async () => {
    try {
      setIsGenerating(true);
      const result = await jeService.generateJEsFromScript();
      setSuccess(`Génération terminée: ${result.generated} JEs créées, ${result.skipped} ignorées`);
      toast.success(`${result.generated} JEs créées avec succès`);
      await fetchJEs(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération');
      toast.error('Erreur lors de la génération des JEs');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditJE = (je: JE) => {
    setCurrentJE(je);
    setIsEditModalOpen(true);
  };

  const handleViewJE = (je: JE) => {
    setCurrentJE(je);
    setIsViewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      CREATED: 'bg-yellow-100 text-yellow-800',
      VERIFIED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
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
            <h1 className="text-3xl font-bold text-foreground">Gestion des JEs</h1>
            <p className="text-muted-foreground">
              Gérez les Junior-Entreprises inscrites à l'événement
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleGenerateJEsFromScript}
              disabled={isGenerating || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FiTerminal className="mr-2 h-4 w-4" />
              {isGenerating ? 'Génération...' : 'Générer depuis script'}
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Ajouter une JE
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/20 border-green-500/50 text-green-foreground">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <JEList
          jes={jes}
          loading={loading}
          handleViewJE={handleViewJE}
          handleEditJE={handleEditJE}
          handleSendCredentialsEmail={handleSendCredentialsEmail}
          handleDeleteJE={handleDeleteJE}
        />

        {/* Modals */}
        <CreateJEModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateJE}
          loading={actionLoading}
        />

        <EditJEModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateJE}
          loading={actionLoading}
          je={currentJE}
        />

        <ViewJEModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          je={currentJE}
          onSendCredentialsEmail={handleSendCredentialsEmail}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  );
}
