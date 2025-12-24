import { apiClient } from '../api-client';

interface PaymentSheet {
  id: number;
  title: string;
  participantIds: number[];
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  validatedAt?: string;
  validatedBy?: number;
  notes?: string;
  adminNotes?: string;
  je: {
    id: number;
    name: string;
  };
  participants: Array<{
    id: number;
    firstName: string;
    lastName: string;
    user: {
      email: string;
    };
  }>;
}

interface PaymentSheetUpdateData {
  participantIds?: number[];
  adminNotes?: string;
  status?: 'APPROVED' | 'REJECTED';
}

class AdminService {
  /**
   * Fetch profile data for the current Admin
   */
  async getProfile(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/admin/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile data');
    }
  }

  /**
   * Get comprehensive reports data
   */
  async getReports(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/admin/reports');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports data');
    }
  }

  /**
   * Update profile data for the current Admin
   */
  async updateProfile(profileData: any): Promise<any> {
    try {
      const response = await apiClient.patch<any>('/admin/profile', profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile data');
    }
  }

  /**
   * Get all payment sheets for admin review
   */
  async getPaymentSheets(): Promise<PaymentSheet[]> {
    try {
      const response = await apiClient.get<PaymentSheet[]>('/admin/payment-sheets');
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
      const response = await apiClient.get<PaymentSheet>(`/admin/payment-sheets/${sheetId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment sheet');
    }
  }

  /**
   * Update a payment sheet (edit participants, add admin notes)
   */
  async updatePaymentSheet(sheetId: number, updateData: PaymentSheetUpdateData): Promise<PaymentSheet> {
    try {
      const response = await apiClient.patch<PaymentSheet>(`/admin/payment-sheets/${sheetId}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment sheet');
    }
  }

  /**
   * Approve a payment sheet and mark participants as paid
   */
  async approvePaymentSheet(sheetId: number, adminNotes?: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(`/admin/payment-sheets/${sheetId}/approve`, {
        adminNotes,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve payment sheet');
    }
  }

  /**
   * Reject a payment sheet
   */
  async rejectPaymentSheet(sheetId: number, adminNotes: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(`/admin/payment-sheets/${sheetId}/reject`, {
        adminNotes,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject payment sheet');
    }
  }

  /**
   * Get all participants for a JE (for editing payment sheets)
   */
  async getJEParticipants(jeId: number): Promise<Array<{
    id: number;
    firstName: string;
    lastName: string;
    user: { email: string };
    payDate: string | null;
    approvedAt: string | null;
  }>> {
    try {
      const response = await apiClient.get<Array<{
        id: number;
        firstName: string;
        lastName: string;
        user: { email: string };
        payDate: string | null;
        approvedAt: string | null;
      }>>(`/admin/jes/${jeId}/participants`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch JE participants');
    }
  }
}

export const adminService = new AdminService();
