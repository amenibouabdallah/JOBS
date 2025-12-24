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
import { ActivityType } from '@/types/activity-type.types';

interface ProgramViewModalProps {
  activities: Activity[];
  types: ActivityType[];
}

export function ProgramViewModal({ activities, types }: ProgramViewModalProps) {
  const groupedActivities = useMemo(() => {
    const typeMap = new Map(types.map(t => [t.id, t.name]));
    return activities.reduce((acc, activity) => {
      const typeName = typeMap.get(activity.activityTypeId) || 'Uncategorized';
      if (!acc[typeName]) {
        acc[typeName] = [];
      }
      acc[typeName].push(activity);
      // Sort activities by start time
      acc[typeName].sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0));
      return acc;
    }, {} as Record<string, Activity[]>);
  }, [activities, types]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Program</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Program View</DialogTitle>
        </DialogHeader>
        {activities.length === 0 ? (
          <p>No activities available to display in the program.</p>
        ) : (
          <div className="space-y-4 overflow-y-auto">
            {Object.keys(groupedActivities).map((typeName) => (
              <div key={typeName}>
                <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-background py-2">{typeName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {groupedActivities[typeName].map((activity: Activity) => (
                    <div key={activity.id} className="p-4 border rounded-md">
                      <p className="font-semibold">{activity.name}</p>
                      <p className="text-sm text-gray-500">Salle: {activity.salle?.name}</p>
                      <p className="text-sm text-gray-500">
                        {activity.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {activity.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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