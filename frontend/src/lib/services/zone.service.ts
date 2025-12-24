import { apiClient } from "../api-client";
export interface Zone {
  id: number;
  name: string;
  description?: string;
  isAvailable: boolean;
  jes: {
    id: number;
    name: string;
    code: string;
    _count: {
      participants: number;
    };
    participants?: any[];
  }[];
}

export const zoneService = {
  getAll: async () => {
    const response = await apiClient.get<Zone[]>('/zones');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await apiClient.get<Zone>(`/zones/${id}`);
    return response.data;
  },

  generate: async (count: number) => {
    const response = await apiClient.post('/zones/generate', { count });
    return response.data;
  },

  assignJe: async (zoneId: number, jeId: number) => {
    const response = await apiClient.post(`/zones/${zoneId}/assign-je`, { jeId });
    return response.data;
  },

  unassignJe: async (jeId: number) => {
    const response = await apiClient.post('/zones/unassign-je', { jeId });
    return response.data;
  },

  reserveZone: async (zoneId: number) => {
    const response = await apiClient.post(`/zones/${zoneId}/reserve`);
    return response.data;
  },

  reservePlace: async (placeNumber: number) => {
    const response = await apiClient.post('/zones/reserve-place', { placeNumber });
    return response.data;
  },

  exportData: async () => {
    const response = await apiClient.get('/zones/export');
    return response.data;
  },

  getMyJeStats: async () => {
    const response = await apiClient.get('/zones/my-je-stats');
    console.log("JE Stats Response:", response.data);
    return response.data;
  },
};
