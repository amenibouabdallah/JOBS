import { apiClient } from '@/lib/api-client';
import type { Participant } from '@/types/participant.types';
import type { User } from '@/types/auth.types';
import uploadsService from './uploads.service'; // Import the new uploadsService

class ParticipantService {
  async uploadProfileImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ url: string }>('/participant/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  }

  async getParticipantProfile(): Promise<Participant & { user: User }> {
    try {
      const response = await apiClient.get<Participant & { user: User }>('/participant/profile');
      return response.data; // Assuming data is directly on response
    } catch (error) {
      throw new Error('Failed to fetch participant profile');
    }
  }

  async updateParticipantProfile(data: Partial<Participant>): Promise<Participant> {
    try {
      const response = await apiClient.patch<Participant>('/participant/profile', data);
      return response.data; // Assuming data is directly on response
    } catch (error) {
      throw new Error('Failed to update participant profile');
    }
  }

  async updatePassword(data: { password: string }): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch<{ message: string }>('/participant/profile/password', data);
      return response.data; // Assuming data is directly on response
    } catch (error) {
      throw new Error('Failed to update password');
    }
  }

  // Admin-only functions
  async getAllParticipants(): Promise<Participant[]> {
    try {
      const response = await apiClient.get<Participant[]>('/participant');
      return response.data; // Assuming data is directly on response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch participants');
    }
  }

  async createParticipant(data: any): Promise<Participant> {
    try {
      const response = await apiClient.post<Participant>('/participant', data);
      return response.data; // Assuming data is directly on response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create participant');
    }
  }

  async updateParticipant(participantId: number, data: any): Promise<Participant> {
    try {
      const response = await apiClient.patch<Participant>(`/participant/${participantId}`, data);
      return response.data; // Assuming data is directly on response
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update participant');
    }
  }

  async deleteParticipant(participantId: number): Promise<void> {
    try {
      await apiClient.delete(`/participant/${participantId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete participant');
    }
  }

  async toggleParticipantPayment(participantId: number, paid: boolean): Promise<void> {
    try {
      await apiClient.patch(`/participant/${participantId}/payment`, { paid });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment status');
    }
  }
}

export const participantService = new ParticipantService();