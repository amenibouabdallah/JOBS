import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function DashboardActionCard({ 
  title, 
  description, 
  icon, 
  onClick,
  className 
}: DashboardActionCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "border-accent hover:border-foreground cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50 group", 
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-md group-hover:bg-red-100 dark:group-hover:bg-red-900/20 transition-colors">
            <div className="text-red-700 dark:text-red-400">
              {icon}
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
