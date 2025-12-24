import { Injectable } from '@nestjs/common';
import { prisma } from '../lib/prisma';

@Injectable()
export class SalleService {
  list() {
    return prisma.salle.findMany({ orderBy: { name: 'asc' } });
  }

  create(data: { name: string; description?: string | null; capacity: number; type?: string }) {
    return prisma.salle.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        capacity: data.capacity,
        type: (data.type as any) ?? 'OTHER',
      },
    });
  }

  update(id: number, data: { name?: string; description?: string | null; capacity?: number; type?: string }) {
    return prisma.salle.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
        ...(data.type !== undefined ? { type: data.type as any } : {}),
      },
    });
  }

  remove(id: number) {
    return prisma.salle.delete({ where: { id } });
  }
}
