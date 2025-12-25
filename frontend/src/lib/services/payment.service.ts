
import { apiClient } from '@/lib/api-client';

interface PaymentConfig {
  firstPayAmount: number;
  secondPayAmount: number;
  fullPayAmount: number;
  payStart: string;
  payDeadline: string;
  firstPayDeadline: string;
  fullPayQrCode?: string;
  firstPayQrCode?: string;
  secondPayQrCode?: string;
}

interface PaymentStatus {
  participant: any;
  hasFirstPayment: boolean;
  hasFullPayment: boolean;
  canPayFirst: boolean;
  canPaySecond: boolean;
  isFullyPaid: boolean;
}

interface InitiatePaymentResponse {
  formUrl: string;
  orderId: string;
  amount: number;
  paymentType: 'FIRST' | 'FULL';
}

interface PaymentResult {
  success: boolean;
  message: string;
  documentReference?: string;
  paymentType?: 'FIRST' | 'FULL';
  amount?: number;
  orderId?: string;
  errorMessage?: string;
}

class PaymentService {
  async getPaymentConfig(): Promise<PaymentConfig> {
    try {
      const response = await apiClient.get<PaymentConfig>('/payment/config');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get payment configuration');
    }
  }

  async getPaymentStatus(): Promise<PaymentStatus> {
    try {
      const response = await apiClient.get<PaymentStatus>('/payment/status');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get payment status');
    }
  }

  async getMyOrders(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/payment/orders');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get orders');
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/payment/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get order status');
    }
  }

  async initiatePayment(paymentType: 'FIRST' | 'FULL', amount: number): Promise<InitiatePaymentResponse> {
    try {
      const response = await apiClient.post<InitiatePaymentResponse>('/payment/initiate', {
        paymentType,
        amount,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate payment');
    }
  }

  async processSecondPayment(amount: number): Promise<InitiatePaymentResponse> {
    try {
      const response = await apiClient.post<InitiatePaymentResponse>('/payment/second', {
        amount,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process second payment');
    }
  }

  async handlePaymentSuccess(orderId: string): Promise<PaymentResult> {
    try {
      const response = await apiClient.post<PaymentResult>('/payment/success', {
        orderId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to handle payment success');
    }
  }

  async handlePaymentFail(orderId: string): Promise<PaymentResult> {
    try {
      const response = await apiClient.post<PaymentResult>('/payment/fail', {
        orderId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to handle payment failure');
    }
  }

  // Admin methods
  async enableSecondPayment(participantId: number): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/payment/admin/enable-second/${participantId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enable second payment');
    }
  }
}

export const paymentService = new PaymentService();
