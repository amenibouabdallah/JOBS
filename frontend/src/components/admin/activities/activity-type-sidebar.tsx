import React from 'react';
import { ActivityType } from '@/types/activity-type.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityTypeSidebarProps {
  types: ActivityType[];
  selectedTypeId: number | null;
  onSelectType: (id: number) => void;
}

export const ActivityTypeSidebar: React.FC<ActivityTypeSidebarProps> = ({
  types,
  selectedTypeId,
  onSelectType,
}) => {
  return (
    <div className="md:col-span-1">
      <Card>
        <CardHeader><CardTitle>Activity Types</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {types.map((t) => (
            <button
              key={t.id}
              className={`w-full text-left px-3 py-2 rounded border ${selectedTypeId === t.id ? 'bg-red-600 text-white border-red-600' : 'hover:bg-muted'}`}
              onClick={() => onSelectType(t.id)}
            >
              <div className="font-medium">{t.name}</div>
              <div className="text-xs opacity-80">
                {t.day +"- "} 
                {t.earliestTime && !isNaN(t.earliestTime.getTime()) ? t.earliestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                {t.latestTime && !isNaN(t.latestTime.getTime()) ? ` - ${t.latestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
