import type { Activity } from './activity.types';

export interface ProgramEntry {
  id: number;
  participantId: number;
  activityId: number;
  enrolledAt: string;
  activity: Activity & { activityType?: { id: number; name: string; timeSlot: string | null } | null };
}
