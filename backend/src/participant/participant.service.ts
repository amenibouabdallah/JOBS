import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { ParticipantRole, UserRole, UserStatus } from '@prisma/client';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateParticipantAdminDto } from './dto/create-participant-admin.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParticipantService {
  private _getPaymentStatus(participant: { payDate: Date | null; firstPayDate: Date | null }): string {
    if (participant.payDate) {
      return 'paid';
    } else if (participant.firstPayDate) {
      return 'first part paid';
    } else {
      return 'unpaid';
    }
  }

  async createMinimal(userId: number) {
    // Check if participant already exists for this user
    const existingParticipant = await prisma.participant.findFirst({
      where: { userId },
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    return prisma.participant.create({
      data: {
        userId,
        role: ParticipantRole.MEMBRE_JUNIOR,
      },
    });
  }

  async createParticipantAsAdmin(createParticipantDto: CreateParticipantAdminDto) {
    const { email, password, jeId, birthdate, ...rest } = createParticipantDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.PARTICIPANT,
        status: UserStatus.APPROVED,
        isOAuth: false,
      },
    });

    const birthdateDate = birthdate ? new Date(birthdate) : undefined;

    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        jeId,
        birthdate: birthdateDate,
        ...rest,
      },
      include: {
        user: true,
        je: true,
      },
    });

    return participant;
  }

  async register(createParticipantDto: CreateParticipantDto) {
    const { userId, birthdate, ...rest } = createParticipantDto;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if participant already exists for this user
    const existingParticipant = await prisma.participant.findFirst({
      where: { userId },
    });

    if (existingParticipant) {
      throw new BadRequestException('Participant already exists for this user');
    }

    // Convert birthdate string to Date if provided
    const birthdateDate = birthdate ? new Date(birthdate) : undefined;

    const participant = await prisma.participant.create({
      data: {
        userId,
        birthdate: birthdateDate,
        ...rest,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            img: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        je: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Update user status to VERIFIED after participant creation
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.VERIFIED },
    });

    return participant;
  }

  async updateProfileImage(userId: number, imageUrl: string) {
    console.log(`[ParticipantService] updateProfileImage called for userId: ${userId} with imageUrl: ${imageUrl}`);
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { img: imageUrl },
      });
      console.log(`[ParticipantService] User ${userId} image updated successfully. New image: ${updatedUser.img}`);
      return updatedUser;
    } catch (error) {
      console.error(`[ParticipantService] Error updating user ${userId} image:`, error);
      throw error;
    }
  }

  async updatePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async findAll() {
    const participants = await prisma.participant.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            img: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        je: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return participants.map(participant => ({
      ...participant,
      paymentStatus: this._getPaymentStatus(participant),
    }));
  }

  async findById(id: number) {
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            img: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        je: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        orders: true,
        certificates: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Add paymentStatus
    const paymentStatus = this._getPaymentStatus(participant);
    return { ...participant, paymentStatus };
  }

  async findByUserId(userId: number) {
    const participant = await prisma.participant.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            img: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        je: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!participant) {
      return null; // Or throw NotFoundException, depending on desired behavior
    }

    return { ...participant, paymentStatus: this._getPaymentStatus(participant) };
  }

  async findProfileByUserId(userId: number) {
    const participant = await prisma.participant.findFirst({
      where: { userId },
      include: {
        user: true,
        je: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant profile not found');
    }

    return participant;
  }

  async findByJeId(jeId: number) {
    const participants = await prisma.participant.findMany({
      where: { jeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            img: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return participants.map(participant => ({
      ...participant,
      paymentStatus: this._getPaymentStatus(participant),
    }));
  }

  async findParticipantsByJeUserId(userId: number) {
    const je = await prisma.jE.findFirst({ where: { userId } });
    if (!je) {
      throw new Error('JE not found');
    }
    return this.findByJeId(je.id);
  }

  async update(id: number, updateParticipantDto: UpdateParticipantDto, userId: number, role: string) {
    const participant = await this.findById(id);

    // Check permissions: admin can update any, JE can only update their participants
    if (role === 'JE') {
      const je = await prisma.jE.findFirst({ where: { userId } });
      if (!je || participant.jeId !== je.id) {
        throw new ForbiddenException('You can only update participants from your JE');
      }
    }

    const { birthdate, ...rest } = updateParticipantDto;
    const birthdateDate = birthdate ? new Date(birthdate) : undefined;

    return prisma.participant.update({
      where: { id },
      data: {
        birthdate: birthdateDate,
        ...rest,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            img: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        je: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: number, updateParticipantDto: UpdateParticipantDto & { img?: string }) {
    const participant = await this.findProfileByUserId(userId);

    const { birthdate, img, ...rest } = updateParticipantDto;
    const birthdateDate = birthdate ? new Date(birthdate) : undefined;

    // If img is provided, update the user's image
    if (img !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { img },
      });
    }

    return prisma.participant.update({
      where: { id: participant.id },
      data: {
        birthdate: birthdateDate,
        ...rest,
      },
    });
  }

  async delete(id: number) {
    const participant = await this.findById(id);

    await prisma.participant.delete({
      where: { id },
    });

    return { message: 'Participant deleted successfully' };
  }

  async approve(id: number, approvedBy: number) {
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        user: true, // Include user to check payDate
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (participant.payDate !== null) {
      throw new BadRequestException('Participant has already paid and cannot be approved.');
    }

    await prisma.participant.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        approvedBy,
      },
    });

    // Update user status to APPROVED
    await prisma.user.update({
      where: { id: participant.userId },
      data: { status: UserStatus.APPROVED },
    });

    return { message: 'Participant approved successfully' };
  }

  async getStats() {
    const totalParticipants = await prisma.participant.count();
    const approvedParticipants = await prisma.participant.count({
      where: {
        user: {
          status: UserStatus.APPROVED,
        },
      },
    });
    const pendingParticipants = await prisma.participant.count({
      where: {
        user: {
          status: UserStatus.VERIFIED,
        },
      },
    });

    return {
      total: totalParticipants,
      approved: approvedParticipants,
      pending: pendingParticipants,
    };
  }

  async toggleParticipantPaymentAdmin(participantId: number, paid: boolean) {
    // Admin can toggle payment for any participant without JE validation
    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    // Update payment status
    await prisma.participant.update({
      where: { id: participantId },
      data: { 
        payDate: paid ? new Date() : null,
        firstPayDate: participant.firstPayDate,
      },
    });

    return { message: `Payment status updated to ${paid ? 'paid' : 'unpaid'}` };
  }
}
