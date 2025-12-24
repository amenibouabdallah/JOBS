import { Injectable, ForbiddenException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { prisma } from '../lib/prisma';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx'; // Import xlsx library
import * as fs from 'fs'; // Import fs for file system operations
import * as path from 'path'; // Import path for path manipulation
import * as crypto from 'crypto';
import { generateJEs } from '../scripts/generate-jes';

export interface CreateJEDto {
  name: string;
  email: string;
  phone?: string;
  code?: string;
}

export interface UpdateJEDto {
  name?: string;
  phone?: string;
}

@Injectable()
export class JeService {
  constructor(private readonly mailService: MailService) {}

  async updateProfileImage(userId: number, imageUrl: string) {
    console.log(`[JeService] updateProfileImage called for userId: ${userId} with imageUrl: ${imageUrl}`);
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { img: imageUrl },
      });
      console.log(`[JeService] User ${userId} image updated successfully. New image: ${updatedUser.img}`);
      return updatedUser;
    } catch (error) {
      console.error(`[JeService] Error updating user ${userId} image:`, error);
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

  async getProfile(jeId: number) {
    return prisma.jE.findUnique({
      where: { id: jeId },
      include: {
        user: {
          select: {
            email: true,
            img: true,
          },
        },
      },
    });
  }

  async updateProfile(jeId: number, updateData: any) {
    const { name, email, password, img } = updateData; // Add 'img' here

    const je = await prisma.jE.findUnique({ where: { id: jeId } });
    if (!je) {
      throw new Error('JE not found');
    }

    const userUpdateData: any = {};
    if (email) {
      userUpdateData.email = email;
    }
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }
    if (img) { // Add this block to update img
      userUpdateData.img = img;
    }

    await prisma.user.update({
      where: { id: je.userId },
      data: userUpdateData,
    });

    return prisma.jE.update({
      where: { id: jeId },
      data: { name },
    });
  }

  async getDashboardData(jeId: number) {
    const je = await prisma.jE.findUnique({
      where: { id: jeId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                status: true,
              },
            },
          },
        },
        reservedZone: true,
      },
    });

    if (!je) {
      throw new Error('JE not found');
    }

    const totalParticipants = je.participants.length;
    const approvedParticipants = je.participants.filter(p => p.user.status === UserStatus.APPROVED).length;
    const paidParticipants = je.participants.filter(p => p.payDate !== null).length;

    const availableZones = await prisma.zone.count({
      where: {
        isAvailable: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { participants, ...jeData } = je;

    return {
      profile: {
        name: jeData.name,
        email: jeData.user.email,
      },
      participants: {
        total: totalParticipants,
        approved: approvedParticipants,
        paid: paidParticipants,
      },
      zone: {
        reservedZone: jeData.reservedZone,
        availableZones: availableZones,
      },
    };
  }

  async findByUserId(userId: number) {
    if (!userId) {
      return null;
    }
    
    return prisma.jE.findFirst({
      where: { userId },
    });
  }

  async uploadPaymentSheet(jeId: number, fileData: { filename: string; path: string }): Promise<{ message: string; processedCount: number }> {
    const fullFilePath = path.join(process.cwd(), fileData.path);

    if (!fs.existsSync(fullFilePath)) {
      throw new Error('Uploaded file not found.');
    }

    const workbook = XLSX.readFile(fullFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    const participantEmails: string[] = excelData.map((row: any) => row.email).filter(Boolean);

    if (participantEmails.length === 0) {
      throw new Error('No participant emails found in the uploaded sheet.');
    }

    // Find participants by email and ensure they belong to this JE
    const participants = await prisma.participant.findMany({
      where: {
        user: {
          email: { in: participantEmails },
        },
        jeId: jeId,
      },
      select: {
        id: true,
        user: {
          select: { email: true }
        }
      }
    });

    const foundParticipantIds = participants.map(p => p.id);
    const foundParticipantEmails = new Set(participants.map(p => p.user.email));

    const notFoundEmails = participantEmails.filter(email => !foundParticipantEmails.has(email));

    if (notFoundEmails.length > 0) {
      // Optionally, you can throw an error or just log them
      console.warn(`The following emails were not found or do not belong to JE ${jeId}: ${notFoundEmails.join(', ')}`);
    }

    if (foundParticipantIds.length === 0) {
      throw new Error('No valid participants found in the sheet for this JE.');
    }

    // Create the payment sheet record
    const paymentSheet = await prisma.paymentSheet.create({
      data: {
        jeId,
        title: fileData.filename,
        filePath: fileData.path,
        participantIds: foundParticipantIds,
        status: 'PENDING', // Default status
      },
    });

    // Optionally, update the participants' payment status here if needed
    // For now, just creating the sheet and returning processed count

    return {
      message: `Payment sheet '${fileData.filename}' uploaded and ${foundParticipantIds.length} participants processed.`,
      processedCount: foundParticipantIds.length,
    };
  }

  async createPaymentSheet(jeId: number, data: { title: string; participantIds: number[]; notes?: string }) {
    // Verify all participants belong to this JE
    const participants = await prisma.participant.findMany({
      where: {
        id: { in: data.participantIds },
        jeId: jeId,
      },
    });

    if (participants.length !== data.participantIds.length) {
      throw new Error('Some participants do not belong to this JE');
    }

    return prisma.paymentSheet.create({
      data: {
        jeId,
        title: data.title,
        participantIds: data.participantIds,
        notes: data.notes,
      },
      include: {
        je: {
          select: { name: true },
        },
      },
    });
  }

  async getPaymentSheets(jeId: number) {
    return prisma.paymentSheet.findMany({
      where: { jeId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        je: {
          select: { name: true },
        },
      },
    });
  }

  async getPaymentSheet(jeId: number, paymentSheetId: number) {
    const paymentSheet = await prisma.paymentSheet.findFirst({
      where: {
        id: paymentSheetId,
        jeId,
      },
      include: {
        je: {
          select: { name: true },
        },
      },
    });

    if (!paymentSheet) {
      throw new Error('Payment sheet not found');
    }

    // Get participant details
    const participants = await prisma.participant.findMany({
      where: {
        id: { in: paymentSheet.participantIds },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
      ...paymentSheet,
      participants,
    };
  }

  async updatePaymentSheet(jeId: number, paymentSheetId: number, data: { title?: string; participantIds?: number[]; notes?: string }) {
    const paymentSheet = await prisma.paymentSheet.findFirst({
      where: {
        id: paymentSheetId,
        jeId,
        status: 'PENDING', // Only allow editing pending sheets
      },
    });

    if (!paymentSheet) {
      throw new Error('Payment sheet not found or cannot be edited');
    }

    // If updating participant IDs, verify they belong to this JE
    if (data.participantIds) {
      const participants = await prisma.participant.findMany({
        where: {
          id: { in: data.participantIds },
          jeId: jeId,
        },
      });

      if (participants.length !== data.participantIds.length) {
        throw new Error('Some participants do not belong to this JE');
      }
    }

    return prisma.paymentSheet.update({
      where: { id: paymentSheetId },
      data,
      include: {
        je: {
          select: { name: true },
        },
      },
    });
  }

  async deletePaymentSheet(jeId: number, paymentSheetId: number) {
    const paymentSheet = await prisma.paymentSheet.findFirst({
      where: {
        id: paymentSheetId,
        jeId,
        status: 'PENDING', // Only allow deleting pending sheets
      },
    });

    if (!paymentSheet) {
      throw new Error('Payment sheet not found or cannot be deleted');
    }

    return prisma.paymentSheet.delete({
      where: { id: paymentSheetId },
    });
  }

  async findAll() {
    return prisma.jE.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
                status: true,
              }
            }
          }
        },
        _count: {
          select: {
            participants: true,
          }
        }
      },
    });
  }

  async findAllBasic() {
    return prisma.jE.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        userId: true,
      },
    });
  }

  async findAllForSignup() {
    // Public method for signup - returns only basic JE info
    return prisma.jE.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      }
    });
  }

  async findOne(id: number) {
    return prisma.jE.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        participants: {
          include: {
            user: {
              select: {
                email: true,
                status: true,
              }
            }
          }
        },
        reservedZone: true,
        paymentSheets: true,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.jE.findUnique({
      where: { code },
    });
  }

  async getParticipants(jeId: number) {
    return prisma.participant.findMany({
      where: { jeId },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            img: true,
          },
        },
      },
    });
  }

  async approveParticipant(jeId: number, participantId: number, approvedByUserId: number) {
    const participant = await prisma.participant.findFirst({
      where: { id: participantId, jeId },
    });

    if (!participant) {
      throw new Error('Participant not found or does not belong to this JE');
    }

    await prisma.user.update({
      where: { id: participant.userId },
      data: { status: UserStatus.APPROVED },
    });

    return prisma.participant.update({
      where: { id: participantId },
      data: {
        approvedAt: new Date(),
        approvedBy: approvedByUserId,
      },
    });
  }

  async updateParticipant(jeId: number, participantId: number, data: any) {
    const participant = await prisma.participant.findFirst({
      where: { id: participantId, jeId },
    });

    if (!participant) {
      throw new Error('Participant not found or does not belong to this JE');
    }

    return prisma.participant.update({
      where: { id: participantId },
      data,
    });
  }

  async create(createJeDto: CreateJEDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: createJeDto.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate JE code if not provided
    const jeCode = createJeDto.code || this.generateJECode(createJeDto.name);
    
    // Generate temporary password
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user account first
    const user = await prisma.user.create({
      data: {
        email: createJeDto.email,
        password: hashedPassword,
        role: UserRole.JE,
        status: UserStatus.APPROVED,
      },
    });

    const je = await prisma.jE.create({
      data: {
        name: createJeDto.name,
        code: jeCode,
        phone: createJeDto.phone,
        userId: user.id,
      },
    });

    // Generate a proper reset token for the invitation
    const token = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000 * 48); // 48 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry,
      },
    });
    
    await this.mailService.sendJeInvitation({ email: user.email, name: je.name }, token);

    return { je, user, tempPassword };
  }

  async update(id: number, updateJeDto: UpdateJEDto) {
    return prisma.jE.update({
      where: { id },
      data: updateJeDto,
    });
  }

  async remove(id: number) {
    const je = await prisma.jE.findUnique({ where: { id } });
    if (je) {
      await prisma.user.delete({ where: { id: je.userId } });
    }
    return prisma.jE.delete({ where: { id } });
  }

  async sendCredentialsEmail(id: number) {
    const je = await prisma.jE.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!je) {
      throw new Error('JE not found');
    }

    // Generate a proper reset token
    const token = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000 * 48); // 48 hours

    await prisma.user.update({
      where: { id: je.userId },
      data: {
        resetToken: token,
        resetTokenExpiry,
      },
    });

    await this.mailService.sendJeInvitation({ email: je.user.email, name: je.name }, token);
    
    return { message: 'Credentials email sent' };
  }

  async sendCredentialsEmailByName(name: string) {
    const je = await prisma.jE.findFirst({
      where: { name },
      include: { user: true },
    });

    if (!je) {
      throw new Error('JE not found');
    }

    // Generate a proper reset token
    const token = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000 * 48); // 48 hours

    await prisma.user.update({
      where: { id: je.userId },
      data: {
        resetToken: token,
        resetTokenExpiry,
      },
    });

    await this.mailService.sendJeInvitation({ email: je.user.email, name: je.name }, token);

    return { message: 'Credentials email sent' };
  }

  async generateJEsFromScript() {
    try {
      const result = await generateJEs();
      return {
        success: true,
        message: `Successfully generated ${result.created} JEs`,
        created: result.created,
        credentials: result.credentials,
      };
    } catch (error) {
      throw new Error(`Failed to generate JEs: ${error.message}`);
    }
  }

  async verifyJECode(jeId: number, code: string) {
    const je = await prisma.jE.findUnique({
      where: { id: jeId },
    });

    if (!je) {
      return false;
    }

    return je.code === code;
  }

  private generateJECode(name: string): string {
    // Take first letter of each word, uppercase
    const acronym = name
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    // Add random 3 digit number
    const randomNum = Math.floor(100 + Math.random() * 900);
    
    return `${acronym}${randomNum}`;
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
