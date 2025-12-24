import React from 'react';
import { ActivityType } from '@/types/activity-type.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ActivityTypeListProps {
  types: ActivityType[];
  onDelete: (id: number) => void;
}

export const ActivityTypeList: React.FC<ActivityTypeListProps> = ({ types, onDelete }) => {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {types.map((t) => (
        <Card key={t.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span>{t.name}</span>
              <Badge variant="secondary" className='ml-2 bg-red-300 dark:bg-red-900'>{t.day}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => onDelete(t.id)}>Delete</Button>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-between pt-0">
            <div className="text-xs text-muted-foreground">
              {t.earliestTime && !isNaN(t.earliestTime.getTime()) ? t.earliestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              {t.latestTime && !isNaN(t.latestTime.getTime()) ? ` - ${t.latestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
