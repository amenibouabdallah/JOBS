import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';

@Injectable()
export class ActivityTypeService {
  list() {
    return prisma.activityType.findMany({ orderBy: [{ day: 'asc' }, { earliestTime: 'asc' }] });
  }

  create(data: { name: string; description?: string; earliestTime?: Date; latestTime?: Date; day: 'J_1' | 'J_2' }) {
    return prisma.activityType.create({
      data: {
        name: data.name,
        description: data.description,
        earliestTime: data.earliestTime,
        latestTime: data.latestTime,
        day: data.day,
      },
    });
  }

  update(id: number, data: { name?: string; description?: string | null; earliestTime?: Date; latestTime?: Date; day?: 'J_1' | 'J_2' }) {
    return prisma.activityType.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return prisma.activityType.delete({ where: { id } });
  }
}
