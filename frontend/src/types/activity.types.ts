import { ActivityType } from './activity-type.types';
import { Salle } from './salle.types';
import { ParticipantRole } from './auth.types';

export type CorrelationRule = 'REQUIRES' | 'EXCLUDES' | 'ALL';

export interface ActivityCorrelation {
  id: number;
  rule: CorrelationRule;
  description: string | null;
  autoPickForRoles: ParticipantRole[];
  role: ParticipantRole | null;
  sourceActivityId: number;
  targetActivityId: number | null;
  sourceActivity?: Activity;
  targetActivity?: Activity;
}

export interface Activity {
  id: number;
  name: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  capacity: number;
  panelists: string[];
  isRequired: boolean;
  activityTypeId: number;
  salleId: number;
  supportId: number | null;
  capacityLeft?: number;

  // Relations (optional, for when included)
  activityType?: ActivityType;
  salle?: Salle;
  correlationsAsSource?: ActivityCorrelation[];
  correlationsAsTarget?: ActivityCorrelation[];
}