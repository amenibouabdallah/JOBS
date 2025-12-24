import { Activity } from '@/types/activity.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold line-clamp-2" title={activity.name}>
          {activity.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 min-h-[3rem]">
          {activity.description || "Aucune description disponible."}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>
              {format(new Date(activity.startTime), 'EEEE d MMMM', { locale: fr })}
              <span className="mx-1">•</span>
              {format(new Date(activity.startTime), 'HH:mm', { locale: fr })} - {format(new Date(activity.endTime), 'HH:mm', { locale: fr })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-red-500" />
            <span className="font-medium">
              {activity.salle?.name || 'Salle non définie'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-green-600" />
            <span>Capacité: {activity.capacity} places</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
