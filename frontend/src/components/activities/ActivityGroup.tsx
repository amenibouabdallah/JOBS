import { Activity } from '@/types/activity.types';
import { Badge } from '@/components/ui/badge';
import { ActivityCard } from './ActivityCard';

interface ActivityGroupProps {
  typeName: string;
  activities: Activity[];
}

export function ActivityGroup({ typeName, activities }: ActivityGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
          {typeName}
        </h2>
        <Badge variant="secondary" className="text-sm">
          {activities.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(activity => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
