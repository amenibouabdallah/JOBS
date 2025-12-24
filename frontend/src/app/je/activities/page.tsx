'use client';

import { useEffect, useState } from 'react';
import { activityService } from '@/lib/services/activity.service';
import type { Activity } from '@/types/activity.types';
import { ActivityGroup } from '@/components/activities/ActivityGroup';
import { JeLayout } from '@/components/layout/JELayout';

export default function JEActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await activityService.getActivities();
        setActivities(data);
      } catch (error: any) {
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Group by Activity Type while preserving order
  const groupedActivities = activities.reduce((acc, activity) => {
    const typeName = activity.activityType?.name || 'Autre';
    if (!acc.has(typeName)) {
      acc.set(typeName, []);
    }
    acc.get(typeName)!.push(activity);
    return acc;
  }, new Map<string, Activity[]>());

  if (loading) {
    return (
      <JeLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </JeLayout>
    );
  }

  if (error) {
    return (
      <JeLayout>
        <div className="min-h-screen flex items-center justify-center text-red-600">
          {error}
        </div>
      </JeLayout>
    );
  }

  return (
    <JeLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Programme des Activités</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Consultez l'ensemble des activités proposées lors de l'événement.
          </p>
        </div>
        
        {groupedActivities.size === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune activité disponible pour le moment.
          </div>
        ) : (
          Array.from(groupedActivities.entries()).map(([typeName, typeActivities]) => (
            <ActivityGroup key={typeName} typeName={typeName} activities={typeActivities} />
          ))
        )}
      </div>
    </JeLayout>
  );
}
