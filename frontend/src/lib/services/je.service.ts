import { apiClient } from '../api-client';
import { JE, CreateJEFormData, UpdateJEFormData, GenerateJEsResult } from '@/types/je.types';
import { Participant, UpdateParticipantFormData } from '@/types/participant.types';
import uploadsService from './uploads.service'; // Import the new uploadsService

export interface JeDashboardData {
  profile: {
    name?: string;
    email?: string;
  };
  participants: {
    total: number;
    approved: number;
    paid: number;
  };
  zone: {
    reservedZone: any; // Replace 'any' with a proper Zone type if you have one
    availableZones: number;
  };
}

export interface PaymentSheet {
  id: number;
  title: string;
  participantIds: number[];
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  validatedAt?: string;
  validatedBy?: number;
  notes?: string;
  adminNotes?: string;
}

class JEService {
  /**
   * Upload a profile image for the current JE
   */
  async uploadProfileImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ url: string }>('/je/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload profile image');
    }
  }

  /**
   * Fetch profile data for the current JE
   */
  async getProfile(): Promise<JE> {
    try {
      const response = await apiClient.get<JE>('/je/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile data');
    }
  }

  /**
   * Update profile data for the current JE
   */
  async updateProfile(profileData: any): Promise<JE> {
    try {
      const response = await apiClient.patch<JE>('/je/profile', profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile data');
    }
  }

  /**
   * Update password for the current JE
   */
  async updatePassword(data: { password: string }): Promise<{ message: string }> {
    try {
      const response = await apiClient.patch<{ message: string }>('/je/profile/password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  }

  /**
   * Fetch dashboard data for the current JE (aggregated data from backend)
   */
  async getDashboardData(): Promise<JeDashboardData> {
    try {
      const response = await apiClient.get<JeDashboardData>('/je/dashboard');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }

  // === Admin JE Management (Admin only) ===

  /**
   * Fetch all JEs (Admin only)
   */
  async fetchJEs(): Promise<JE[]> {
    try {
      const response = await apiClient.get<JE[]>('/je');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch JEs');
    }
  }

  /**
   * Fetch JEs for signup (public endpoint)
   */
  async fetchJEsForSignup(): Promise<JE[]> {
    try {
      const response = await apiClient.get<JE[]>('/je/public/list');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch JEs for signup');
    }
  }

  /**
   * Get specific JE details
   */
  async getJE(jeId: number): Promise<JE> {
    try {
      const response = await apiClient.get<JE>(`/je/${jeId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch JE details');
    }
  }

  /**
   * Create a new JE (Admin only)
   */
  async createJE(jeData: CreateJEFormData): Promise<JE> {
    try {
      const response = await apiClient.post<JE>('/je', jeData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create JE');
    }
  }

  /**
   * Update an existing JE (Admin or JE owner)
   */
  async updateJE(jeId: number, jeData: UpdateJEFormData): Promise<JE> {
    try {
      const response = await apiClient.patch<JE>(`/je/${jeId}`, jeData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update JE');
    }
  }

  /**
   * Delete a JE (Admin only)
   */
  async deleteJE(jeId: number): Promise<void> {
    try {
      await apiClient.delete(`/je/${jeId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete JE');
    }
  }

  /**
   * Send credentials email to a JE (Admin only)
   */
  async sendJECredentialsEmail(jeId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(`/je/${jeId}/send-credentials-email`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send credentials email');
    }
  }

  /**
   * Generate JEs from script (Admin only)
   */
  async generateJEsFromScript(): Promise<GenerateJEsResult> {
    try {
      const response = await apiClient.post<GenerateJEsResult>('/je/generate-from-script');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate JEs from script');
    }
  }

  /**
   * Find JE by code
   */
  async findJEByCode(code: string): Promise<JE> {
    try {
      const response = await apiClient.get<JE>(`/je/by-code/${code}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to find JE by code');
    }
  }

  /**
   * Verify JE code
   */
  async verifyJECode(jeId: number, code: string): Promise<{ valid: boolean }> {
    try {
      const response = await apiClient.post<{ valid: boolean }>(`/je/${jeId}/verify-code`, { code });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify JE code');
    }
  }

  // === JE-specific participant management ===

  /**
   * Get participants for current JE
   */
  async getParticipants(): Promise<Participant[]> {
    try {
      const response = await apiClient.get<Participant[]>('/je/participants');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch participants');
    }
  }

  /**
   * Approve a participant
   */
  async approveParticipant(participantId: number): Promise<void> {
    try {
      await apiClient.post(`/je/participants/${participantId}/approve`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve participant');
    }
  }

  /**
   * Update participant data (limited to JE permissions)
   */
  async updateParticipant(participantId: number, participantData: UpdateParticipantFormData): Promise<Participant> {
    try {
      const response = await apiClient.patch<Participant>(`/je/participants/${participantId}`, participantData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update participant');
    }
  }

  // === Payment Sheet Management ===

  /**
   * Create a payment sheet with selected participants
   */
  async createPaymentSheet(data: { title: string; participantIds: number[]; notes?: string }): Promise<{ message: string; sheetId: number }> {
    try {
      const response = await apiClient.post<{ message: string; sheetId: number }>('/je/payment-sheets', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment sheet');
    }
  }

  /**
   * Get all payment sheets for current JE
   */
  async getPaymentSheets(): Promise<PaymentSheet[]> {
    try {
      const response = await apiClient.get<PaymentSheet[]>('/je/payment-sheets');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment sheets');
    }
  }

  /**
   * Get a specific payment sheet by ID
   */
  async getPaymentSheet(sheetId: number): Promise<PaymentSheet> {
    try {
      const response = await apiClient.get<PaymentSheet>(`/je/payment-sheets/${sheetId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment sheet');
    }
  }

  /**
   * Update a payment sheet
   */
  async updatePaymentSheet(sheetId: number, updateData: { title?: string; participantIds?: number[]; notes?: string }): Promise<PaymentSheet> {
    try {
      const response = await apiClient.patch<PaymentSheet>(`/je/payment-sheets/${sheetId}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment sheet');
    }
  }

  /**
   * Delete a payment sheet
   */
  async deletePaymentSheet(sheetId: number): Promise<void> {
    try {
      await apiClient.delete(`/je/payment-sheets/${sheetId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete payment sheet');
    }
  }

  /**
   * Upload payment sheet file (legacy)
   */
  async uploadPaymentSheetFile(file: File): Promise<{ url: string; filename: string }> {
    try {
      const response = await uploadsService.uploadFile(file, 'payment-sheets', '(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload payment sheet');
    }
  }

  /**
   * Get all JEs (Admin only)
   */
  async getAllJes(): Promise<JE[]> {
    try {
      const response = await apiClient.get<JE[]>('/je/basic');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch JEs');
    }
  }
}

export const jeService = new JEService();