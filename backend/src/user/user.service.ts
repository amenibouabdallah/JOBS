import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { UserRole, UserStatus } from '@prisma/client';

export interface CreateUserDto {
  email: string;
  password?: string;
  role: UserRole;
  googleId?: string;
  isOAuth?: boolean;
  img?: string;
}

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto) {
    return prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        img: true,
        isOAuth: true,
        createdAt: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        participants: true,
        jes: true,
        admins: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: { googleId },
    });
  }

  async updateStatus(id: number, status: UserStatus) {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async updateResetToken(id: number, resetToken: string, resetTokenExpiry: Date) {
    return prisma.user.update({
      where: { id },
      data: { 
        resetToken, 
        resetTokenExpiry 
      } as any,
    });
  }

  async findByResetToken(resetToken: string) {
    return prisma.user.findUnique({
      where: { resetToken } as any,
    });
  }

  async updatePassword(id: number, password: string) {
    return prisma.user.update({
      where: { id },
      data: { 
        password, 
        resetToken: null, 
        resetTokenExpiry: null 
      } as any,
    });
  }

  async clearResetToken(id: number) {
    return prisma.user.update({
      where: { id },
      data: { 
        resetToken: null, 
        resetTokenExpiry: null 
      } as any,
    });
  }

  async update(id: number, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async findParticipantByUserId(userId: number) {
    return prisma.participant.findFirst({
      where: { userId },
    });
  }

  async createParticipant(participantData: any) {
    return prisma.participant.create({
      data: participantData,
    });
  }
}
