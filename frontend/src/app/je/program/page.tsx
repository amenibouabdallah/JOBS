"use client";

import { useEffect, useState } from 'react';
import { activityService } from '@/lib/services/activity.service';
import type { Activity } from '@/types/activity.types';
import { JeLayout } from '@/components/layout/JELayout';

export default function JEProgramPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const acts = await activityService.getActivities();
        setActivities(acts);
      } catch (e: any) {
        setError(e.message || 'Failed to load program');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <JeLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Program Catalogue</h1>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activities.map((a) => (
              <div key={a.id} className="border rounded p-4">
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-muted-foreground">{a.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </JeLayout>
  );
}
