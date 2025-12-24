'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, BuildingOfficeIcon, CalendarIcon, MapIcon } from '@heroicons/react/24/outline';

export interface Stat {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface Props {
  stats: Stat[];
}

export function DashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
