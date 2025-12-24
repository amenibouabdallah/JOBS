'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Activity } from '@/types/activity.types';
import { Salle } from '@/types/salle.types';

interface ActivitiesBySalleViewModalProps {
  activities: Activity[];
  salles: Salle[];
}

export function ActivitiesBySalleViewModal({
  activities,
  salles,
}: ActivitiesBySalleViewModalProps) {
  const groupedActivities = useMemo(() => {
    return activities.reduce<Record<string, Activity[]>>((acc, item) => {
      const salleName = salles.find((s) => s.id === item.salleId)?.name || 'Unassigned';
      if (!acc[salleName]) {
        acc[salleName] = [];
      }
      acc[salleName].push(item);
      return acc;
    }, {} as Record<string, Activity[]>);
  }, [activities, salles]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Activities by Salle</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Activities by Salle View</DialogTitle>
        </DialogHeader>
        {activities.length === 0 ? (
          <p>No activities data available.</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(groupedActivities).map((salleName) => (
              <div key={salleName}>
                <h3 className="text-lg font-semibold mb-2">{salleName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedActivities[salleName].map((activity: Activity) => (
                    <div key={activity.id} className="p-4 border rounded-md">
                      <p className="font-semibold">{activity.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.startTime).toLocaleTimeString()} - {new Date(activity.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}