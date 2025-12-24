
import { Controller, Post, Body, UseGuards, Get, Param, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

interface InitiatePaymentDto {
  paymentType: 'FIRST' | 'FULL';
  amount: number;
}

interface PaymentCallbackDto {
  orderId: string;
}

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get('config')
  async getPaymentConfig() {
    return this.paymentService.getPaymentConfig();
  }

  @Get('status')
  @Roles(UserRole.PARTICIPANT)
  async getPaymentStatus(@CurrentUser('sub') userId: number) {
    return this.paymentService.checkParticipantPaymentStatus(userId);
  }

  @Get('orders')
  @Roles(UserRole.PARTICIPANT)
  async getMyOrders(@CurrentUser('sub') userId: number) {
    return this.paymentService.getParticipantOrders(userId);
  }

  @Get('orders/:orderId')
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  async getOrderStatus(@CurrentUser('sub') userId: number, @CurrentUser('role') role: UserRole, @Param('orderId') orderId: string) {
    return this.paymentService.getPaymentStatus(orderId, userId, role);
  }

  @Post('initiate')
  @Roles(UserRole.PARTICIPANT)
  async initiatePayment(@CurrentUser('sub') userId: number, @Body() dto: InitiatePaymentDto) {
    if (!dto.paymentType || !dto.amount) {
      throw new BadRequestException('Payment type and amount are required');
    }

    if (dto.paymentType !== 'FIRST' && dto.paymentType !== 'FULL') {
      throw new BadRequestException('Payment type must be FIRST or FULL');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    try {
      return await this.paymentService.initiatePayment(
        userId,
        dto.paymentType,
        dto.amount
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('second')
  @Roles(UserRole.PARTICIPANT)
  async processSecondPayment(@CurrentUser('sub') userId: number, @Body() dto: { amount: number }) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Valid amount is required');
    }

    try {
      return await this.paymentService.processSecondPayment(userId, dto.amount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('success')
  async handlePaymentSuccess(@Body() dto: PaymentCallbackDto) {
    if (!dto.orderId) {
      throw new BadRequestException('Order ID is required');
    }

    try {
      return await this.paymentService.handlePaymentSuccess(dto.orderId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('fail')
  async handlePaymentFail(@Body() dto: PaymentCallbackDto) {
    if (!dto.orderId) {
      throw new BadRequestException('Order ID is required');
    }

    try {
      return await this.paymentService.handlePaymentFail(dto.orderId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('invoice/:orderId/generate')
  @Roles(UserRole.PARTICIPANT, UserRole.ADMIN)
  async generateInvoice(@Param('orderId') orderId: string, @CurrentUser('sub') userId: number, @CurrentUser('role') role: UserRole) {
    return this.paymentService.generateInvoiceForOrder(orderId, { userId, role });
  }

  @Post('certificate/generate')
  @Roles(UserRole.PARTICIPANT)
  async generateCertificate(@CurrentUser('sub') userId: number) {
    return this.paymentService.generateCertificateForParticipant(userId);
  }

  // Admin endpoints
  @Post('admin/enable-second/:participantId')
  @Roles(UserRole.ADMIN)
  async enableSecondPayment(@Param('participantId') participantId: string) {
    const id = parseInt(participantId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid participant ID');
    }

    try {
      return await this.paymentService.enableSecondPaymentForParticipant(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
