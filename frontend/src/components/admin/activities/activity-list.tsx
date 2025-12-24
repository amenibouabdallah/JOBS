import React from 'react';
import { Activity } from '@/types/activity.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LinkIcon } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  salleNameById: Map<number, string>;
  onDelete: (id: number) => void;
  correlatedActivityIds: Set<number>;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  salleNameById,
  onDelete,
  correlatedActivityIds,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {activities.map((a) => (
        <Card key={a.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                {a.name}
                {correlatedActivityIds.has(a.id) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    Correlated
                  </Badge>
                )}
              </span>
              {a.isRequired && <Badge>Required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">Time: {a.startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {a.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-sm text-muted-foreground">Salle: {salleNameById.get(a.salleId) || a.salleId}</div>
            <div className="text-sm text-muted-foreground">Capacity: {a.capacity}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onDelete(a.id)}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
