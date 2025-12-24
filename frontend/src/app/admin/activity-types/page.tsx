"use client";
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { activityTypeService } from '@/lib/services/activity-type.service';
import type { ActivityType, Day } from '@/types/activity-type.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ActivityTypeList } from '@/components/admin/activity-types/activity-type-list';
import { CreateActivityTypeForm } from '@/components/admin/activity-types/create-activity-type-form';

export default function AdminActivityTypesPage() {
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityTypeService.list()
      .then((data: ActivityType[]) => {
        setTypes(data);
      })
      .catch(() => toast.error('Failed to load activity types'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (name: string, earliestTime: Date, latestTime: Date, day: Day) => {
    try {
      const created = await activityTypeService.create({ name, earliestTime, latestTime, day });
      setTypes((p) => [created, ...p]);
      toast.success('Activity type created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Create failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete type?')) return;
    try {
      await activityTypeService.remove(id);
      setTypes((p) => p.filter((s) => s.id !== id));
      toast.success('Activity type deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Activity Types</h1>
        <CreateActivityTypeForm onCreate={handleCreate} />
        {loading ? (
          <div>Loading activity types...</div>
        ) : (
          <ActivityTypeList types={types} onDelete={handleDelete} />
        )}
      </div>
    </AdminLayout>
  );
}
