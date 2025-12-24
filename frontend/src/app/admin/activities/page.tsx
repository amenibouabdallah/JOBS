"use client"
import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { activityService } from '@/lib/services/activity.service';
import type { Activity } from '@/types/activity.types';
import type { Salle } from '@/types/salle.types';
import type { ActivityType } from '@/types/activity-type.types';
import { toast } from 'sonner';
import { ActivityTypeSidebar } from '@/components/admin/activities/activity-type-sidebar';
import { CreateActivityForm } from '@/components/admin/activities/create-activity-form';
import { ActivityList } from '@/components/admin/activities/activity-list';
import { activityTypeService } from '@/lib/services/activity-type.service';
import { salleService } from '@/lib/services/salle.service';
import { ProgramViewModal } from '@/components/admin/activities/ProgramViewModal';
import { CorrelationsViewModal } from '@/components/admin/activities/CorrelationsViewModal';
import { ActivitiesBySalleViewModal } from '@/components/admin/activities/ActivitiesBySalleViewModal';
import { ParticipantRole } from '@/types/auth.types';

export default function AdminActivitiesPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [actsResponse, ssResponse, tsResponse, corrsResponse] = await Promise.all([
        activityService.adminList().catch(() => []),
        salleService.list().catch(() => []),
        activityTypeService.list().catch(() => []),
        activityService.listCorrelations().catch(() => []),
      ]);

      const formattedActs = (actsResponse as Activity[]).map(activity => ({
        ...activity,
        startTime: activity.startTime ? new Date(activity.startTime) : activity.startTime,
        endTime: activity.endTime ? new Date(activity.endTime) : activity.endTime,
      }));

      const formattedTypes = (tsResponse as ActivityType[]).map(type => ({
        ...type,
        earliestTime: type.earliestTime ? new Date(type.earliestTime) : type.earliestTime,
        latestTime: type.latestTime ? new Date(type.latestTime) : type.latestTime,
      }));

      setActivities(formattedActs);
      setSalles(ssResponse);
      setTypes(formattedTypes);
      setCorrelations(corrsResponse);

      if (formattedTypes.length && !selectedTypeId) {
        setSelectedTypeId(formattedTypes[0].id);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load page data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const salleNameById = useMemo(() => new Map(salles.map(s => [s.id, s.name])), [salles]);
  const filteredActivities = useMemo(
    () => (selectedTypeId ? activities.filter((a) => a.activityTypeId === selectedTypeId) : activities),
    [activities, selectedTypeId],
  );

  const handleCreateActivity = async (form: any) => {
    try {
      const created = await activityService.adminCreate(form);
      setActivities((prev) => [created, ...prev]);
      toast.success('Activity created');
    } catch (e: any) {
      toast.error(e.message || 'Create failed');
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('Delete activity?')) return;
    try {
      await activityService.adminDelete(id);
      setActivities((p) => p.filter((a) => a.id !== id));
      toast.success('Deleted');
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const handleCreateCorrelation = async (data: { sourceActivityId: number; targetActivityId: number; rule: 'REQUIRES' | 'EXCLUDES' | 'ALL'; role: ParticipantRole | null }) => {
    try {
      const newCorrelation = await activityService.addCorrelation(data);
      const sourceActivity = activities.find(a => a.id === data.sourceActivityId);
      const targetActivity = activities.find(a => a.id === data.targetActivityId);

      if (sourceActivity && targetActivity) {
        const fullCorrelation = {
          ...newCorrelation,
          sourceActivity,
          targetActivity,
        };
        setCorrelations((prev) => [...prev, fullCorrelation]);
      } else {
        loadAllData();
      }
      toast.success('Correlation created');
    } catch (error) {
      toast.error('Failed to create correlation');
    }
  };

  const handleDeleteCorrelation = async (id: number) => {
    if (!confirm('Delete correlation?')) return;
    try {
      await activityService.removeCorrelation(id);
      setCorrelations((prev) => prev.filter((c) => c.id !== id));
      toast.success('Correlation deleted');
    } catch (error) {
      toast.error('Failed to delete correlation');
    }
  };

  const correlatedActivityIds = useMemo(() => {
    const idSet = new Set<number>();
    correlations.forEach(corr => {
      idSet.add(corr.sourceActivityId);
      idSet.add(corr.targetActivityId);
    });
    return idSet;
  }, [correlations]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Activities</h1>
          <div className="flex space-x-2">
            <ProgramViewModal activities={activities} types={types} />
            <CorrelationsViewModal
              activities={activities}
              correlations={correlations}
              onCreate={handleCreateCorrelation}
              onDelete={handleDeleteCorrelation}
            />
            <ActivitiesBySalleViewModal activities={activities} salles={salles} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ActivityTypeSidebar
            types={types}
            selectedTypeId={selectedTypeId}
            onSelectType={setSelectedTypeId}
          />
          <div className="md:col-span-3 space-y-4">
            <CreateActivityForm
              salles={salles}
              types={types}
              selectedTypeId={selectedTypeId}
              onCreate={handleCreateActivity}
              onSelectType={setSelectedTypeId}
            />
            {loading ? (
              <div>Loading activities...</div>
            ) : (
              <ActivityList
                activities={filteredActivities}
                salleNameById={salleNameById}
                onDelete={handleDeleteActivity}
                correlatedActivityIds={correlatedActivityIds}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}