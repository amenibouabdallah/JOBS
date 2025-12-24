
import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import axios from 'axios';
import { generateCertificatePDF, generateInvoicePDF } from '../lib/pdf';

interface ClicToPayResponse {
  formUrl?: string;
  orderId?: string;
  errorCode?: string;
  errorMessage?: string;
}

interface ClicToPayStatusResponse {
  OrderNumber?: string;
  Amount?: string;
  Currency?: string;
  OrderStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  approvalCode?: string;
  authCode?: string;
  Pan?: string;
  expiration?: string;
  cardholderName?: string;
  depositAmount?: string;
  fee?: string;
}

@Injectable()
export class PaymentService {
  private readonly clictopayUsername = process.env.CLICTOPAY_USERNAME;
  private readonly clictopayPassword = process.env.CLICTOPAY_PASSWORD;
  private readonly frontendUrl = process.env.FRONTEND_URL;
  private paymentApiUrl: string;
  private statusApiUrl: string;

  constructor() {
    const isDevelopment = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development';
    const baseUrl = isDevelopment ? 'https://test.clictopay.com' : 'https://ipay.clictopay.com';
    this.paymentApiUrl = `${baseUrl}/payment/rest/register.do`;
    this.statusApiUrl = `${baseUrl}/payment/rest/getOrderStatus.do`;
    
    console.log(`[PaymentService] Initialized with ${isDevelopment ? 'TEST' : 'PRODUCTION'} ClicToPay environment`);
    console.log(`[PaymentService] Payment API: ${this.paymentApiUrl}`);
    console.log(`[PaymentService] Status API: ${this.statusApiUrl}`);
  }

  async getPaymentConfig() {
    const jobs = await prisma.jobs.findFirst({
      where: { isActive: true },
    });

    if (!jobs) {
      throw new Error('No active event found');
    }

    return {
      firstPayAmount: jobs.firstPayAmount || 0,
      secondPayAmount: jobs.secondPayAmount || 0,
      fullPayAmount: jobs.PayAmount || 0,
      payStart: jobs.payStart,
      payDeadline: jobs.payDeadline,
      firstPayDeadline: jobs.firstPayDeadline,
    };
  }

  async checkParticipantPaymentStatus(userId: number) {
    const participant = await prisma.participant.findFirst({
      where: { userId },
      include: {
        orders: {
          where: { status: 'PAID' },
          include: {
            payReceipts: true,
            payInvoices: true,
          },
        },
      },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    const hasFirstPayment = participant.firstPayDate !== null;
    const hasFullPayment = participant.payDate !== null;

    return {
      participant,
      hasFirstPayment,
      hasFullPayment,
      canPayFirst: !hasFirstPayment && !hasFullPayment,
      canPaySecond: hasFirstPayment && !hasFullPayment,
      isFullyPaid: hasFullPayment,
    };
  }

  async initiatePayment(userId: number, paymentType: 'FIRST' | 'FULL', amount: number) {
    // Check participant eligibility
    const status = await this.checkParticipantPaymentStatus(userId);
    
    if (status.isFullyPaid) {
      throw new Error('Payment already completed');
    }

    if (paymentType === 'FIRST' && !status.canPayFirst) {
      throw new Error('First payment not allowed');
    }

    if (paymentType === 'FULL' && status.hasFirstPayment) {
      throw new Error('Cannot pay full amount after partial payment');
    }

    // Validate amount against configuration
    const config = await this.getPaymentConfig();
    let expectedAmount: number;

    if (paymentType === 'FIRST') {
      expectedAmount = config.firstPayAmount;
    } else {
      expectedAmount = config.fullPayAmount;
    }

    if (Math.abs(amount - expectedAmount) > 0.01) {
      throw new Error(`Invalid amount. Expected ${expectedAmount} DT`);
    }

    // Check if participant has required data
    if (!status.participant.cinPassport) {
      throw new Error('CIN/Passport is required for payment');
    }

    // Generate unique order number (our internal ID)
    const orderNumber = this.generateOrderId();
    
    // Create order in database
    const jobs = await prisma.jobs.findFirst({ where: { isActive: true } });
    if (!jobs) {
      throw new Error('No active event found');
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        participantId: status.participant.id,
        jobsId: jobs.id,
        totalAmount: amount,
        status: 'PENDING',
        paymentMethod: 'CLICTOPAY',
        notes: `${paymentType} payment`,
      },
    });

    // Initialize payment with ClicToPay
    try {
      const paymentResponse = await this.createClicToPayOrder(orderNumber, amount);
      
      if (!paymentResponse.formUrl || !paymentResponse.orderId) {
        // Update order status to failed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'FAILED',
            errorMessage: paymentResponse.errorMessage || 'Failed to get payment URL',
            errorCode: paymentResponse.errorCode,
          },
        });
        throw new Error('Failed to initialize payment with ClicToPay');
      }

      // Store ClicToPay's orderId in our database
      await prisma.order.update({
        where: { id: order.id },
        data: {
          clictopayOrderId: paymentResponse.orderId,
        },
      });

      return {
        formUrl: paymentResponse.formUrl,
        orderId: orderNumber, // Return our internal order number for the URL
        amount,
        paymentType,
      };
    } catch (error) {
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });
      throw error;
    }
  }

  async handlePaymentSuccess(orderNumberFromUrl: string) {
    try {
      console.log(`[PaymentSuccess] Received orderNumber from URL: ${orderNumberFromUrl}`);
      
      // First, find the order in our database using the orderNumber from the URL
      const order = await prisma.order.findUnique({
        where: { orderNumber: orderNumberFromUrl },
        include: {
          participant: {
            include: { user: true },
          },
          jobs: true,
        },
      });

      if (!order) {
        console.error(`[PaymentSuccess] Order not found: ${orderNumberFromUrl}`);
        throw new Error('Order not found in our system');
      }

      console.log(`[PaymentSuccess] Found order in DB. OrderNumber: ${order.orderNumber}, ClicToPayOrderId: ${order.clictopayOrderId}, Amount: ${order.totalAmount}`);

      if (!order.clictopayOrderId) {
        console.error(`[PaymentSuccess] No ClicToPay orderId found for order: ${orderNumberFromUrl}`);
        throw new Error('ClicToPay order ID not found - payment not initialized properly');
      }

      // Now, use the ClicToPay orderId to query their API
      const paymentStatus = await this.getClicToPayStatus(order.clictopayOrderId);
      console.log(`[PaymentSuccess] ClicToPay status:`, paymentStatus);

      // Check if payment was declined or has an error
      if (paymentStatus.ErrorCode && paymentStatus.ErrorCode !== '0') {
        console.error(`[PaymentSuccess] Payment declined or failed. ErrorCode: ${paymentStatus.ErrorCode}, Message: ${paymentStatus.ErrorMessage}`);
        
        // Update order status to failed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'FAILED',
            errorCode: paymentStatus.ErrorCode,
            errorMessage: paymentStatus.ErrorMessage || 'Payment declined',
            clictopayData: JSON.parse(JSON.stringify(paymentStatus)),
            updatedAt: new Date(),
          },
        });
        
        throw new Error(`Payment declined: ${paymentStatus.ErrorMessage || 'Unknown error'} (Code: ${paymentStatus.ErrorCode})`);
      }

      // Verify payment amount - ClicToPay returns amount in millimes (1 DT = 1000 millimes)
      const paidAmountInMillimes = parseFloat(paymentStatus.Amount || '0');
      const paidAmount = paidAmountInMillimes / 1000; // Convert from millimes to DT
      const expectedAmountInMillimes = order.totalAmount * 1000;
      
      console.log(`[PaymentSuccess] Payment verification - Expected: ${order.totalAmount} DT (${expectedAmountInMillimes} millimes), Received: ${paidAmount} DT (${paidAmountInMillimes} millimes)`);
      
      // Allow 1 DT (1000 millimes) tolerance for rounding
      if (Math.abs(paidAmountInMillimes - expectedAmountInMillimes) > 1000) {
        console.error(`[PaymentSuccess] Amount mismatch - Expected: ${expectedAmountInMillimes} millimes, Got: ${paidAmountInMillimes} millimes`);
        throw new Error(`Payment amount mismatch: expected ${order.totalAmount} DT, received ${paidAmount} DT`);
      }

      const approvalCode = paymentStatus.approvalCode || paymentStatus.authCode;
      console.log(`[PaymentSuccess] Approval code: ${approvalCode}`);
      
      if (!approvalCode) {
        console.error('[PaymentSuccess] No approval code received from ClicToPay');
        throw new Error('Payment not approved - no approval code received');
      }

      // Update order status
      console.log(`[PaymentSuccess] Updating order status to PAID`);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          approvalCode,
          clictopayData: JSON.parse(JSON.stringify(paymentStatus)),
          updatedAt: new Date(),
        },
      });

      // Determine payment type based on amount
      const config = await this.getPaymentConfig();
      const isFirstPayment = Math.abs(paidAmount - config.firstPayAmount) < 0.01;
      const isFullPayment = Math.abs(paidAmount - config.fullPayAmount) < 0.01;

      let documentReference: string;

      if (isFirstPayment) {
        // Create receipt for first payment
        const receipt = await prisma.payReceipt.create({
          data: {
            orderId: order.id,
            amount: paidAmount,
            paymentMethod: 'CLICTOPAY',
            transactionId: approvalCode,
          },
        });

        // Update participant first payment date
        await prisma.participant.update({
          where: { id: order.participantId },
          data: { firstPayDate: new Date() },
        });

        documentReference = `REC-${receipt.id.toString().padStart(6, '0')}`;
      } else if (isFullPayment) {
        // Create invoice for full payment
        const invoice = await prisma.payInvoice.create({
          data: {
            orderId: order.id,
            amount: paidAmount,
            description: 'Full payment',
          },
        });

        // Update participant full payment date
        await prisma.participant.update({
          where: { id: order.participantId },
          data: { 
            payDate: new Date(),
            // Keep firstPayDate if it exists, otherwise set it too
            firstPayDate: order.participant.firstPayDate || new Date(),
          },
        });

        documentReference = `INV-${invoice.id.toString().padStart(6, '0')}`;
      } else {
        throw new Error('Invalid payment amount');
      }

      return {
        success: true,
        message: 'Payment processed successfully',
        documentReference,
        paymentType: isFirstPayment ? 'FIRST' : 'FULL',
        amount: paidAmount,
        orderId: order.orderNumber,
      };
    } catch (error) {
      console.error('Payment success handling error:', error);
      throw error;
    }
  }

  async handlePaymentFail(orderNumberFromUrl: string) {
    try {
      // Find order in database using the orderNumber from the URL
      const order = await prisma.order.findUnique({
        where: { orderNumber: orderNumberFromUrl },
      });

      if (!order) {
        throw new Error('Order not found in our system');
      }

      // Get payment status from ClicToPay if we have the ClicToPay orderId
      let paymentStatus = null;
      if (order.clictopayOrderId) {
        paymentStatus = await this.getClicToPayStatus(order.clictopayOrderId);
      }

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'FAILED',
          errorCode: paymentStatus?.ErrorCode,
          errorMessage: paymentStatus?.ErrorMessage || 'Payment failed',
          clictopayData: paymentStatus ? JSON.parse(JSON.stringify(paymentStatus)) : null,
          updatedAt: new Date(),
        },
      });

      return {
        success: false,
        message: 'Payment failed',
        errorMessage: paymentStatus?.ErrorMessage || 'Unknown error',
        orderId: order.orderNumber,
      };
    } catch (error) {
      console.error('Payment fail handling error:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderNumber: string, userId: number, userRole: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        participant: { include: { user: true } },
        payReceipts: true,
        payInvoices: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Authorization check
    if (userRole !== 'ADMIN' && order.participant.userId !== userId) {
      throw new Error('Unauthorized access to payment information');
    }

    return order;
  }

  async getParticipantOrders(userId: number) {
    const participant = await prisma.participant.findFirst({
      where: { userId },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    return prisma.order.findMany({
      where: { participantId: participant.id },
      include: {
        payReceipts: true,
        payInvoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async createClicToPayOrder(orderId: string, amount: number): Promise<ClicToPayResponse> {
    const amountInMillimes = Math.round(amount * 1000); // Convert DT to millimes
    
    const returnUrl = `${this.frontendUrl}/payment/success?orderId=${orderId}`;
    const failUrl = `${this.frontendUrl}/payment/fail?orderId=${orderId}`;
    
    // ClicToPay API parameters - all values must be strings
    const params = {
      userName: this.clictopayUsername,
      password: this.clictopayPassword,
      amount: amountInMillimes.toString(),
      currency: '788', // (TND)
      language: 'fr',
      orderNumber: orderId,
      returnUrl,
      failUrl,
      description: `JOBS2K26 Event Payment - ${amount} DT`, // Payment description
      sessionTimeoutSecs: '1800', // 30 minutes
      pageView: 'DESKTOP', // Desktop view
      clientId: orderId, // Client identifier (use orderNumber)
    };

    console.log(`[ClicToPay] Creating payment order:`);
    console.log(`  - OrderNumber: ${orderId}`);
    console.log(`  - Amount: ${amount} DT (${amountInMillimes} millimes)`);
    console.log(`  - Currency: 788 (TND)`);
    console.log(`  - ReturnUrl: ${returnUrl}`);
    console.log(`  - FailUrl: ${failUrl}`);
    console.log(`  - API URL: ${this.paymentApiUrl}`);
    console.log(`  - Username: ${this.clictopayUsername}`);

    try {
      // Use GET with params object (ClicToPay uses GET for registration)
      const response = await axios.get(this.paymentApiUrl, { 
        params,
        timeout: 30000,
      });
      
      console.log(`[ClicToPay] Registration response:`, response.data);
      
      if (response.data.errorCode && response.data.errorCode !== 0) {
        console.error(`[ClicToPay] Registration error: ${response.data.errorMessage} (Code: ${response.data.errorCode})`);
      }
      
      return response.data;
    } catch (error) {
      console.error('[ClicToPay] API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('[ClicToPay] Response status:', error.response?.status);
        console.error('[ClicToPay] Response data:', error.response?.data);
        console.error('[ClicToPay] Request config:', {
          url: error.config?.url,
          params: error.config?.params,
        });
      }
      throw new Error('Failed to communicate with payment gateway');
    }
  }

  private async getClicToPayStatus(orderNumber: string): Promise<ClicToPayStatusResponse> {
    const params = {
      orderId: orderNumber, // ClicToPay API expects 'orderId' parameter with the orderNumber value
      userName: this.clictopayUsername,
      password: this.clictopayPassword,
      language: 'en',
    };

    console.log(`[ClicToPay] Checking status for order: ${orderNumber}`);
    console.log(`[ClicToPay] API URL: ${this.statusApiUrl}`);

    try {
      const response = await axios.get(this.statusApiUrl, { params });
      console.log(`[ClicToPay] Status response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('[ClicToPay] Status API error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('[ClicToPay] Response data:', error.response.data);
      }
      throw new Error('Failed to get payment status from ClicToPay');
    }
  }

  private generateOrderId(): string {
    const timestamp = new Date().toISOString().replace(/-|:|\.\d+/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`;
  }

  // Admin methods for handling second payments
  async enableSecondPaymentForParticipant(participantId: number) {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    if (!participant.firstPayDate) {
      throw new Error('Participant has not made first payment');
    }

    if (participant.payDate) {
      throw new Error('Participant has already paid in full');
    }

    // This could set a flag or update a deadline for second payment
    // For now, we'll just return the current status
    return {
      participantId,
      canPaySecond: true,
      firstPayDate: participant.firstPayDate,
    };
  }

  async processSecondPayment(userId: number, amount: number) {
    const status = await this.checkParticipantPaymentStatus(userId);
    
    if (!status.canPaySecond) {
      throw new Error('Second payment not allowed');
    }

    const config = await this.getPaymentConfig();
    if (Math.abs(amount - config.secondPayAmount) > 0.01) {
      throw new Error(`Invalid amount. Expected ${config.secondPayAmount} DT`);
    }

    // Process similar to initiate payment but for second payment
    return this.initiatePayment(userId, 'FULL', amount); // Use FULL for second payment as it completes the payment
  }

  async generateInvoiceForOrder(orderNumber: string, user: { userId: number; role: string }) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        participant: { include: { user: true, je: true } },
        payInvoices: true,
      },
    });
    if (!order) throw new Error('Order not found');
    if (user.role !== 'ADMIN' && order.participant.userId !== user.userId) {
      throw new Error('Unauthorized');
    }
    const invoiceNumber = order.payInvoices[0]?.id ?? order.id;
    const filePath = await generateInvoicePDF({
      invoiceNumber,
      invoiceReference: order.orderNumber,
      name: `${order.participant.firstName || ''} ${order.participant.lastName || ''}`.trim() || order.participant.user.email,
      participant: { role: order.participant.role },
      jeName: order.participant.jeId ? (await prisma.jE.findUnique({ where: { id: order.participant.jeId } }))?.name : null,
      cin: order.participant.cinPassport,
      unitPriceHT: Number(order.totalAmount),
      vatPercent: 19,
    });
    const url = '/uploads' + filePath.split('uploads')[1].replace(/\\/g, '/');
    return { filePath, url };
  }

  async generateCertificateForParticipant(userId: number) {
    const participant = await prisma.participant.findFirst({ where: { userId } });
    if (!participant) throw new Error('Participant not found');
    const name = `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Participant';
    const filePath = await generateCertificatePDF(name, participant.id);
    const url = '/uploads' + filePath.split('uploads')[1].replace(/\\/g, '/');
    return { filePath, url };
  }
}
