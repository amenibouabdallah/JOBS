import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { PaymentSheetStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  async getProfile(userId: number) {
    return prisma.admin.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: number, updateData: any) {
    const { email, password } = updateData;

    const userUpdateData: any = {};
    if (email) {
      userUpdateData.email = email;
    }
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    return prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });
  }

  // Payment Sheet Management
  async getAllPaymentSheets() {
    return prisma.paymentSheet.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        je: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getPaymentSheet(paymentSheetId: number) {
    const paymentSheet = await prisma.paymentSheet.findUnique({
      where: { id: paymentSheetId },
      include: {
        je: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
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

  async updatePaymentSheet(paymentSheetId: number, data: { title?: string; participantIds?: number[]; notes?: string; adminNotes?: string }) {
    const paymentSheet = await prisma.paymentSheet.findUnique({
      where: { id: paymentSheetId },
    });

    if (!paymentSheet) {
      throw new Error('Payment sheet not found');
    }

    // If updating participant IDs, verify they belong to the same JE
    if (data.participantIds) {
      const participants = await prisma.participant.findMany({
        where: {
          id: { in: data.participantIds },
          jeId: paymentSheet.jeId,
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

  async approvePaymentSheet(paymentSheetId: number, adminId: number, adminNotes?: string) {
    const paymentSheet = await this.getPaymentSheet(paymentSheetId);

    if (paymentSheet.status !== 'PENDING') {
      throw new Error('Payment sheet is not pending approval');
    }

    // Start transaction to update payment sheet and participants
    return prisma.$transaction(async (tx) => {
      // Update payment sheet status
      const updatedSheet = await tx.paymentSheet.update({
        where: { id: paymentSheetId },
        data: {
          status: PaymentSheetStatus.APPROVED,
          validatedAt: new Date(),
          validatedBy: adminId,
          adminNotes,
        },
      });

      // Update all participants to mark them as paid
      await tx.participant.updateMany({
        where: {
          id: { in: paymentSheet.participantIds },
        },
        data: {
          payDate: new Date(),
        },
      });

      return updatedSheet;
    });
  }

  async rejectPaymentSheet(paymentSheetId: number, adminId: number, adminNotes: string) {
    const paymentSheet = await prisma.paymentSheet.findUnique({
      where: { id: paymentSheetId },
    });

    if (!paymentSheet) {
      throw new Error('Payment sheet not found');
    }

    if (paymentSheet.status !== 'PENDING') {
      throw new Error('Payment sheet is not pending approval');
    }

    return prisma.paymentSheet.update({
      where: { id: paymentSheetId },
      data: {
        status: PaymentSheetStatus.REJECTED,
        validatedAt: new Date(),
        validatedBy: adminId,
        adminNotes,
      },
    });
  }

  async deletePaymentSheet(paymentSheetId: number) {
    const paymentSheet = await prisma.paymentSheet.findUnique({
      where: { id: paymentSheetId },
    });

    if (!paymentSheet) {
      throw new Error('Payment sheet not found');
    }

    // Only allow deletion if not approved
    if (paymentSheet.status === 'APPROVED') {
      throw new Error('Cannot delete approved payment sheet');
    }

    return prisma.paymentSheet.delete({
      where: { id: paymentSheetId },
    });
  }

  // Get payment statistics for admin dashboard
  async getPaymentStatistics() {
    const totalSheets = await prisma.paymentSheet.count();
    const pendingSheets = await prisma.paymentSheet.count({
      where: { status: 'PENDING' },
    });
    const approvedSheets = await prisma.paymentSheet.count({
      where: { status: 'APPROVED' },
    });
    const rejectedSheets = await prisma.paymentSheet.count({
      where: { status: 'REJECTED' },
    });

    const totalPaidParticipants = await prisma.participant.count({
      where: { payDate: { not: null } },
    });

    const totalParticipants = await prisma.participant.count();

    return {
      paymentSheets: {
        total: totalSheets,
        pending: pendingSheets,
        approved: approvedSheets,
        rejected: rejectedSheets,
      },
      participants: {
        total: totalParticipants,
        paid: totalPaidParticipants,
        unpaid: totalParticipants - totalPaidParticipants,
      },
    };
  }

  // Get comprehensive reports for admin
  async getReports() {
    try {
      // Run all independent queries in parallel to avoid connection pool exhaustion
      const [
        totalParticipants,
        approvedParticipants,
        paidParticipants,
        participantsByRole,
        totalJEs,
        jesWithParticipants,
        totalActivities,
        activityTypesWithCounts,
        paymentStats,
        totalZones,
        reservedZones,
        totalSalles,
        sallesGrouped,
        recentParticipants,
      ] = await Promise.all([
        // Participants statistics
        prisma.participant.count(),
        prisma.participant.count({
          where: { user: { status: 'APPROVED' } },
        }),
        prisma.participant.count({
          where: { payDate: { not: null } },
        }),
        prisma.participant.groupBy({
          by: ['role'],
          _count: { id: true },
        }),
        
        // JE statistics
        prisma.jE.count(),
        prisma.jE.findMany({
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                participants: true,
              },
            },
          },
          orderBy: {
            participants: {
              _count: 'desc',
            },
          },
        }),
        
        // Activities statistics
        prisma.activity.count(),
        prisma.activityType.findMany({
          include: {
            _count: {
              select: { activities: true },
            },
          },
        }),
        
        // Payment statistics
        this.getPaymentStatistics(),
        
        // Zones statistics
        prisma.zone.count(),
        prisma.zone.count({
          where: { isAvailable: false },
        }),
        
        // Salles statistics
        prisma.salle.count(),
        prisma.salle.findMany({
          select: {
            type: true,
          },
        }),
        
        // Recent registrations (last 7 days)
        prisma.participant.count({
          where: {
            user: {
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
        }),
      ]);

      // Group salles by type manually
      const sallesByType = sallesGrouped.reduce((acc, salle) => {
        const existing = acc.find(s => s.type === salle.type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: salle.type, count: 1 });
        }
        return acc;
      }, [] as Array<{ type: string; count: number }>);

      return {
        participants: {
          total: totalParticipants,
          approved: approvedParticipants,
          paid: paidParticipants,
          unpaid: totalParticipants - paidParticipants,
          recent: recentParticipants,
          byRole: participantsByRole.map((r) => ({
            role: r.role,
            count: r._count.id,
          })),
        },
        jes: {
          total: totalJEs,
          topJEsByParticipants: jesWithParticipants.slice(0, 10).map((je) => ({
            id: je.id,
            name: je.name,
            participantCount: je._count.participants,
          })),
        },
        activities: {
          total: totalActivities,
          byType: activityTypesWithCounts.map((type) => ({
            id: type.id,
            name: type.name,
            count: type._count.activities,
          })),
        },
        payments: paymentStats,
        zones: {
          total: totalZones,
          reserved: reservedZones,
          available: totalZones - reservedZones,
        },
        salles: {
          total: totalSalles,
          byType: sallesByType.map((s) => ({
            type: s.type,
            count: s.count,
          })),
        },
      };
    } catch (error) {
      console.error('Error in getReports:', error);
      throw error;
    }
  }
}
