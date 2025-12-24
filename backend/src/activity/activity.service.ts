import { BadRequestException, Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { generateProgramPDF } from '../lib/pdf';

@Injectable()
export class ActivityService {
  async getActivities(forAdmin = false) {
    const include = {
      activityType: true,
      salle: true,
      correlationsAsSource: true,
      ...(forAdmin && { support: true }),
      _count: {
        select: { programs: true },
      },
    };
    const activities = await prisma.activity.findMany({
      include,
      orderBy: [{ activityType: { day: 'asc' } }, { activityType: { earliestTime: 'asc' } }, { startTime: 'asc' }],
    });

    return activities.map(activity => ({
      ...activity,
      capacityLeft: activity.capacity - activity._count.programs,
    }));
  }

  async listForAdmin() {
    return this.getActivities(true);
  }

  async getProgram() {
    return prisma.program.findMany({
      include: {
        participant: {
          include: {
            user: true,
          },
        },
        activity: {
          include: {
            activityType: true,
          },
        },
      },
    });
  }

  async listSalles() {
    return prisma.salle.findMany({ orderBy: { name: 'asc' } });
  }

  async listTypes() {
    return prisma.activityType.findMany({ orderBy: { earliestTime: 'asc' } });
  }

  async createActivity(data: {
    name: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    capacity?: number;
    panelists?: string[];
    isRequired?: boolean;
    requiredForRoles?: string[];
    activityTypeId: number;
    salleId: number;
    supportId?: number | null;
  }) {
  if (!data.activityTypeId) throw new BadRequestException('Activity Type is required');
  if (!data.salleId) throw new BadRequestException('Salle is required');
    return prisma.activity.create({
      data: {
        name: data.name,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
        panelists: data.panelists ?? [],
        isRequired: data.isRequired ?? false,
  requiredForRoles: (data.requiredForRoles as any) ?? [],
        activityTypeId: data.activityTypeId,
        salleId: data.salleId,
        supportId: data.supportId ?? null,
      },
    });
  }

  async updateActivity(id: number, data: Partial<{ name: string; description: string | null; startTime: Date; endTime: Date; capacity: number; panelists: string[]; isRequired: boolean; requiredForRoles: string[]; activityTypeId: number; salleId: number; supportId: number | null }>) {
    if (data.salleId === null) throw new BadRequestException('Salle cannot be null');
    return prisma.activity.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteActivity(id: number) {
    return prisma.activity.delete({ where: { id } });
  }

  async addCorrelation(body: { sourceActivityId: number; targetActivityId?: number; rule: 'REQUIRES' | 'EXCLUDES' | 'ALL'; description?: string; autoPickForRoles?: string[]; role?: string }) {
    if (!body.targetActivityId && !body.role) {
      throw new BadRequestException('Either target activity or role must be specified');
    }
    return prisma.activityCorrelation.create({
      data: {
        rule: body.rule,
        description: body.description,
        autoPickForRoles: (body.autoPickForRoles as any) ?? [],
        role: body.role as any,
        sourceActivity: { connect: { id: body.sourceActivityId } },
        targetActivity: body.targetActivityId ? { connect: { id: body.targetActivityId } } : undefined,
      },
    });
  }

  async listCorrelations() {
  return prisma.activityCorrelation.findMany({ include: { sourceActivity: true, targetActivity: true } });
  }

  async removeCorrelation(id: number) {
    return prisma.activityCorrelation.delete({ where: { id } });
  }

  async getMyProgram(userId: number) {
    const participant = await prisma.participant.findFirst({ where: { userId } });
    if (!participant) throw new BadRequestException('Participant not found');
    return prisma.program.findMany({
      where: { participantId: participant.id },
  include: { activity: { include: { activityType: true, salle: true } } },
      orderBy: { enrolledAt: 'asc' },
    });
  }

  async selectActivity(userId: number, activityId: number) {
    const participant = await prisma.participant.findFirst({
      where: { userId },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) throw new BadRequestException('Activity not found');

    // Enforce required-for-role
    if (activity.requiredForRoles?.length) {
      // If participant role in requiredForRoles, selecting is allowed but it's already required implicitly; continue
    }

    // Fetch existing selections for same timeslot/type to avoid conflicts
    const existing = await prisma.program.findMany({
      where: { participantId: participant.id },
      include: { activity: { include: { activityType: true } } },
    });

    const target = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { activityType: true },
    });

    // Allow one per type timeslot if timeSlot is set
    const targetActivityType = target?.activityType;
    const targetDay = targetActivityType?.day;
    const targetStartTime = target?.startTime;
    const targetEndTime = target?.endTime;

    const conflict = existing.find((p) => {
      const existingActivity = p.activity;
      const existingActivityType = existingActivity.activityType;
      const existingDay = existingActivityType?.day;
      const existingStartTime = existingActivity.startTime;
      const existingEndTime = existingActivity.endTime;

      // Check for same day and overlapping times
      return (
        targetDay === existingDay &&
        targetStartTime < existingEndTime &&
        targetEndTime > existingStartTime
      );
    });

    if (conflict) {
      // replace selection in same slot by deleting old and inserting new
      await prisma.program.delete({ where: { id: conflict.id } });
    }

    // Correlation checks
    const correlations = await prisma.activityCorrelation.findMany({
      where: { OR: [{ sourceActivityId: activityId }, { targetActivityId: activityId }] },
    });

    // If target of an EXCLUDES with any already selected source, deny
    const selectedIds = new Set(existing.map((e) => e.activityId));
    for (const c of correlations) {
      // Check Role Exclusion (Source is activityId, Target is NULL, Role matches)
      if (c.sourceActivityId === activityId && !c.targetActivityId && c.role === participant.role && c.rule === 'EXCLUDES') {
        throw new BadRequestException('This activity is excluded for your role');
      }

      if (c.rule === 'EXCLUDES' && c.targetActivityId) {
        if ((c.sourceActivityId === activityId && selectedIds.has(c.targetActivityId)) || (c.targetActivityId === activityId && selectedIds.has(c.sourceActivityId))) {
          // Check if role constraint applies
          if (!c.role || c.role === participant.role) {
            throw new BadRequestException('Selection conflicts with existing activity (exclusion rule)');
          }
        }
      }
      if (c.rule === 'REQUIRES' && c.targetActivityId === activityId) {
        // selecting target without source, allow; but when selecting source we will auto pick target; here no-op
      }
    }

    // Create selection for requested activity
    const created = await prisma.program.create({ data: { participantId: participant.id, activityId } });

    // If the selected activity has REQUIRES with autoPick to some target, auto add
    const requires = await prisma.activityCorrelation.findMany({ where: { sourceActivityId: activityId, rule: 'REQUIRES' } });
    for (const r of requires) {
      // Check if role constraint applies (if r.role is set, user must have that role)
      const roleMatches = !r.role || r.role === participant.role;
      
      if (roleMatches && r.targetActivityId) {
        const shouldAutoPick = (r.autoPickForRoles ?? []).length === 0 || (r.autoPickForRoles as any).includes(participant.role);
        if (shouldAutoPick && !selectedIds.has(r.targetActivityId) && r.targetActivityId !== activityId) {
          // Ensure no conflicts in same slot; naive insert
          const already = await prisma.program.findFirst({ where: { participantId: participant.id, activityId: r.targetActivityId } });
          if (!already) {
            await prisma.program.create({ data: { participantId: participant.id, activityId: r.targetActivityId } });
          }
        }
      }
    }

    return created;
  }

  async deselectActivity(userId: number, activityId: number) {
    const participant = await prisma.participant.findFirst({ where: { userId } });
    if (!participant) throw new BadRequestException('Participant not found');
    const act = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!act) throw new BadRequestException('Activity not found');
    // Prevent deselecting required activities
    if (act.isRequired || (act.requiredForRoles?.length && act.requiredForRoles.includes(participant.role as any))) {
      throw new BadRequestException('Cannot deselect a required activity');
    }

    // Check if required by correlation
    const requiredByCorrelation = await prisma.activityCorrelation.findFirst({
      where: {
        sourceActivityId: activityId,
        OR: [
          { rule: 'ALL', OR: [{ role: null }, { role: participant.role }] },
          { rule: 'REQUIRES', targetActivityId: null, role: participant.role }
        ]
      }
    });

    if (requiredByCorrelation) {
      throw new BadRequestException('Cannot deselect a required activity (enforced by rule)');
    }

    const prog = await prisma.program.findFirst({ where: { participantId: participant.id, activityId } });
    if (!prog) return { ok: true };
    await prisma.program.delete({ where: { id: prog.id } });
    return { ok: true };
  }

  async ensureRequiredSelectionsForParticipant(userId: number) {
    const participant = await prisma.participant.findFirst({ where: { userId } });
    if (!participant) throw new BadRequestException('Participant not found');
    const required = await prisma.activity.findMany({
      where: {
        OR: [
          { isRequired: true },
          { requiredForRoles: { has: participant.role as any } },
        ],
      },
    });
    const existing = await prisma.program.findMany({ where: { participantId: participant.id } });
    const existingSet = new Set(existing.map((e) => e.activityId));
    for (const act of required) {
      if (!existingSet.has(act.id)) {
        await prisma.program.create({ data: { participantId: participant.id, activityId: act.id } });
      }
    }

    // Check for Role Correlations (REQUIRES + Role + No Target) OR (ALL)
    const roleCorrelations = await prisma.activityCorrelation.findMany({
      where: {
        OR: [
          {
            role: participant.role,
            rule: 'REQUIRES',
            targetActivityId: null,
          },
          {
            rule: 'ALL',
            OR: [
              { role: null },
              { role: participant.role }
            ]
          }
        ]
      },
    });

    const addedIds: number[] = [];
    for (const corr of roleCorrelations) {
      if (!existingSet.has(corr.sourceActivityId)) {
        await prisma.program.create({ data: { participantId: participant.id, activityId: corr.sourceActivityId } });
        addedIds.push(corr.sourceActivityId);
        existingSet.add(corr.sourceActivityId);
      }
    }

    return { added: [...required.filter((r) => !existingSet.has(r.id)).map((r) => r.id), ...addedIds] };
  }

  async updateProgram(userId: number, activityIds: number[]) {
    const participant = await prisma.participant.findFirst({ where: { userId } });
    if (!participant) throw new BadRequestException('Participant not found');

    // 1. Get current program
    const currentProgram = await prisma.program.findMany({
      where: { participantId: participant.id },
    });
    const currentIds = new Set(currentProgram.map(p => p.activityId));
    const newIds = new Set(activityIds);

    // 2. Identify changes
    const toAdd = activityIds.filter(id => !currentIds.has(id));
    const toRemove = currentProgram.filter(p => !newIds.has(p.activityId));

    // 3. Validate removals (check if required)
    for (const prog of toRemove) {
      const activity = await prisma.activity.findUnique({ where: { id: prog.activityId } });
      if (activity) {
        // Check basic requirements
        if (activity.isRequired || (activity.requiredForRoles?.length && activity.requiredForRoles.includes(participant.role as any))) {
          throw new BadRequestException(`Cannot remove required activity: ${activity.name}`);
        }
        // Check correlation requirements
        const requiredByCorrelation = await prisma.activityCorrelation.findFirst({
          where: {
            sourceActivityId: activity.id,
            OR: [
              { rule: 'ALL', OR: [{ role: null }, { role: participant.role }] },
              { rule: 'REQUIRES', targetActivityId: null, role: participant.role }
            ]
          }
        });
        if (requiredByCorrelation) {
          throw new BadRequestException(`Cannot remove required activity: ${activity.name} (enforced by rule)`);
        }
      }
    }

    // 4. Process removals
    for (const prog of toRemove) {
      await prisma.program.delete({ where: { id: prog.id } });
    }

    // 5. Process additions (using selectActivity logic for checks)
    // We process them sequentially to handle conflicts and correlations
    for (const id of toAdd) {
      // We can reuse selectActivity but we need to be careful about the transaction/state
      // Since we already removed conflicting items (if user did it right), selectActivity might still find conflicts if user didn't remove them
      // But selectActivity automatically handles conflicts by replacing.
      // However, selectActivity throws if there is an exclusion.
      // So we just call selectActivity for each added ID.
      await this.selectActivity(userId, id);
    }

    return this.getMyProgram(userId);
  }

  async generateMyProgramPDF(userId: number) {
    const participant = await prisma.participant.findFirst({
      where: { userId },
      include: {
        je: true,
        Program: {
          include: {
            activity: {
              include: {
                activityType: true,
                salle: true,
              },
            },
          },
        },
      },
    });

    if (!participant) {
      throw new BadRequestException('Participant not found');
    }

    const activities = participant.Program.map((p) => ({
      name: p.activity.name,
      type: p.activity.activityType.name,
      startTime: p.activity.startTime,
      endTime: p.activity.endTime,
      salle: p.activity.salle.name,
    }));

    const pdfPath = await generateProgramPDF({
      participantName: `${participant.firstName} ${participant.lastName}`,
      participantRole: participant.role,
      jeName: participant.je?.name || 'N/A',
      activities,
    });

    return pdfPath;
  }
}
