import { apiClient } from '@/lib/api-client';
import type { Activity, ActivityCorrelation } from '@/types/activity.types';
import type { Salle } from '@/types/salle.types';
import type { ParticipantRole } from '@/types/auth.types';

export interface ProgramActivity {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  maxParticipants: number | null;
  type: {
    id: number;
    name: string;
    color: string;
  };
  participantsCount: number;
}

export interface ActivityRules {
  mandatoryIds: Set<number>;
  forbiddenIds: Set<number>;
  dependencies: Map<number, { required: number[]; excluded: number[] }>;
}

class ActivityService {
  async getActivities(): Promise<Activity[]> {
    try {
      const response = await apiClient.get<Activity[]>('/activities');
      return response.data.map(activity => ({
        ...activity,
        startTime: new Date(activity.startTime),
        endTime: new Date(activity.endTime),
      }));
    } catch (error) {
      throw new Error('Failed to fetch activities');
    }
  }

  async selectActivity(activityId: number): Promise<void> {
    try {
      await apiClient.post<void>(`/activities/${activityId}/select`);
    } catch (error) {
      throw new Error('Failed to select activity');
    }
  }

  async deselectActivity(activityId: number): Promise<void> {
    try {
      await apiClient.delete<void>(`/activities/${activityId}/select`);
    } catch (error) {
      throw new Error('Failed to deselect activity');
    }
  }

  async ensureRequired(): Promise<void> {
    const response = await apiClient.post('/activities/ensure-required');
    return response.data;
  }

  async updateProgram(activityIds: number[]): Promise<any> {
    const response = await apiClient.post('/activities/program', { activityIds });
    return response.data;
  }

  async downloadMyProgram(): Promise<void> {
    const response = await apiClient.get('/activities/my-program/pdf', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mon_Programme_JOBS_2K26.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async getMyProgram(): Promise<any[]> {
    const response = await apiClient.get('/activities/me');
    return response.data;
  }

  // Admin endpoints
  async adminList(): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>('/activities/admin/list');
    return response.data.map(activity => ({
      ...activity,
      startTime: activity.startTime ? new Date(activity.startTime) : activity.startTime,
      endTime: activity.endTime ? new Date(activity.endTime) : activity.endTime,
    }));
  }

  async adminCreate(activity: Partial<Activity> & { activityTypeId: number; salleId: number }): Promise<Activity> {
    const response = await apiClient.post<Activity>('/activities/admin', activity);
    const createdActivity = response.data;
    return {
      ...createdActivity,
      startTime: createdActivity.startTime ? new Date(createdActivity.startTime) : createdActivity.startTime,
      endTime: createdActivity.endTime ? new Date(createdActivity.endTime) : createdActivity.endTime,
    };
  }

  async adminUpdate(id: number, activity: Partial<Activity>): Promise<Activity> {
    const response = await apiClient.patch(`/activities/admin/${id}`, activity);
    return response.data;
  }

  async adminDelete(id: number): Promise<void> {
    await apiClient.delete(`/activities/admin/${id}`);
  }

  async listCorrelations(): Promise<any[]> {
    const response = await apiClient.get('/activities/admin/correlations');
    return response.data;
  }

  async addCorrelation(body: { sourceActivityId: number; targetActivityId: number; rule: 'REQUIRES' | 'EXCLUDES' | 'ALL'; description?: string; autoPickForRoles?: string[]; role?: string | null }): Promise<any> {
    const response = await apiClient.post('/activities/admin/correlations', body);
    return response.data;
  }

  async removeCorrelation(id: number): Promise<void> {
    await apiClient.delete(`/activities/admin/correlations/${id}`);
  }

  organizeRules(activities: Activity[], userRole: ParticipantRole): ActivityRules {
    const mandatoryIds = new Set<number>();
    const forbiddenIds = new Set<number>();
    const dependencies = new Map<number, { required: number[]; excluded: number[] }>();

    activities.forEach(activity => {
      // 1. Global Required
      if (activity.isRequired) {
        mandatoryIds.add(activity.id);
      }

      // 2. Role Required (via requiredForRoles array on Activity)
      // Note: The backend type might not expose requiredForRoles directly if not included, 
      // but let's assume it's there or we rely on correlations.
      // Actually, the backend schema has requiredForRoles String[], but it might not be in the DTO unless we requested it.
      // Let's check if we can rely on correlations for this too, or if we need to check the property.
      // The backend getActivities doesn't explicitly include requiredForRoles in the select/include, 
      // but it's a scalar field so it should be returned by default.
      if ((activity as any).requiredForRoles?.includes(userRole)) {
        mandatoryIds.add(activity.id);
      }

      // 3. Process Correlations
      if (activity.correlationsAsSource) {
        activity.correlationsAsSource.forEach(corr => {
          // Activity -> Role Rules
          if (corr.role === userRole) {
            if (corr.rule === 'REQUIRES' || corr.rule === 'ALL') {
              // If I am this role, I MUST pick this source activity?
              // OR does it mean "To pick this source, I must be this role"?
              // Based on backend logic: "Cannot remove required activity... enforced by rule"
              // It implies if rule matches, the activity is REQUIRED for the user.
              if (!corr.targetActivityId) {
                 mandatoryIds.add(activity.id);
              }
            } else if (corr.rule === 'EXCLUDES') {
              // If I am this role, I CANNOT pick this source activity
              if (!corr.targetActivityId) {
                forbiddenIds.add(activity.id);
              }
            }
          }

          // Activity -> Activity Rules
          if (corr.targetActivityId) {
            // If I pick Source (activity.id), what happens to Target?
            if (!dependencies.has(activity.id)) {
              dependencies.set(activity.id, { required: [], excluded: [] });
            }
            const deps = dependencies.get(activity.id)!;

            if (corr.rule === 'REQUIRES' || corr.rule === 'ALL') {
              // Picking Source REQUIRES Target
              deps.required.push(corr.targetActivityId);
            } else if (corr.rule === 'EXCLUDES') {
              // Picking Source EXCLUDES Target
              deps.excluded.push(corr.targetActivityId);
            }
          }
        });
      }
    });

    return { mandatoryIds, forbiddenIds, dependencies };
  }

  async getAdminProgram(): Promise<ProgramActivity[]> {
    const response = await apiClient.get<ProgramActivity[]>('/activities/admin/program');
    return response.data;
  }
}

export const activityService = new ActivityService();
