
'use client';

import { useEffect, useState } from 'react';
import { activityService } from '@/lib/services/activity.service';
import type { Activity } from '@/types/activity.types';
import type { ProgramEntry } from '@/types/program.types';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  useEffect(() => {
  const loadActivities = async () => {
      try {
  await activityService.ensureRequired();
    const data = await activityService.getActivities();
    setActivities(data);
    // Load my current selections
  const mine = await activityService.getMyProgram();
    setSelectedActivities(mine.map((m: any) => m.activityId));
      } catch (error: any) {
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const handleSelectActivity = async (activityId: number) => {
    try {
      await activityService.selectActivity(activityId);
      setSelectedActivities(prev => [...prev, activityId]);
    } catch (error: any) {
      setError(error.message || 'Failed to select activity');
    }
  };
  const handleDeselect = async (activityId: number) => {
    try {
      await activityService.deselectActivity(activityId);
      setSelectedActivities(prev => prev.filter((id) => id !== activityId));
    } catch (e: any) {
      setError(e.message || 'Failed to deselect');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Activities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(activity => (
          <div key={activity.id} className="bg-white dark:bg-neutral-900 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">{activity.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{activity.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{activity.time}</span>
              {selectedActivities.includes(activity.id) ? (
                <button onClick={() => handleDeselect(activity.id)} className="bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-md">Deselect</button>
              ) : (
                <button
                  onClick={() => handleSelectActivity(activity.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Select
                </button>
              )}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Salle: {(activity as any).salle?.name || '—'} • Type: {(activity as any).activityType?.name || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
