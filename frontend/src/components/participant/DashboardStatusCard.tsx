import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardStatusCardProps {
  title: string;
  value: string;
  statusColor?: 'green' | 'yellow' | 'red' | 'gray';
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardStatusCard({ 
  title, 
  value, 
  statusColor = 'gray', 
  icon,
  className 
}: DashboardStatusCardProps) {
  
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'yellow': return 'text-yellow-600 dark:text-yellow-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-900 dark:text-white';
    }
  };

  const getIndicatorColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className={cn("border-foreground shadow-sm", className)}>
      <CardContent className="p-6">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {icon ? (
            <div className="text-gray-400">{icon}</div>
          ) : (
            <span className={`w-2 h-2 rounded-full ${getIndicatorColor(statusColor)}`}></span>
          )}
          <p className={cn("text-lg font-semibold capitalize", getStatusColor(statusColor))}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
