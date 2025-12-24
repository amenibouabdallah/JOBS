import { apiClient } from '@/lib/api-client';
import type { ActivityType } from '@/types/activity-type.types';

class ActivityTypeService {
  async list(): Promise<ActivityType[]> { 
    const response = await apiClient.get<ActivityType[]>('/activity-types');
    return response.data.map(type => ({
      ...type,
      earliestTime: type.earliestTime ? new Date(type.earliestTime) : undefined,
      latestTime: type.latestTime ? new Date(type.latestTime) : undefined,
    }));
  }
  async create(data: Partial<ActivityType> & { name: string }): Promise<ActivityType> { 
    const response = await apiClient.post<ActivityType>('/activity-types', data);
    const createdType = response.data;
    return {
      ...createdType,
      earliestTime: createdType.earliestTime ? new Date(createdType.earliestTime) : undefined,
      latestTime: createdType.latestTime ? new Date(createdType.latestTime) : undefined,
    };
  }
  async update(id: number, data: Partial<ActivityType>): Promise<ActivityType> { 
    const response = await apiClient.patch(`/activity-types/${id}`, data);
    return response.data;
  }
  async remove(id: number): Promise<void> { 
    await apiClient.delete(`/activity-types/${id}`);
  }
}

export const activityTypeService = new ActivityTypeService();
