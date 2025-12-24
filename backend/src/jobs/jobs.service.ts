import { Injectable } from '@nestjs/common';
import { Jobs, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

@Injectable()
export class JobsService {
  constructor() {}

  async list(): Promise<Jobs[]> {
    return prisma.jobs.findMany();
  }

  async create(data: Prisma.JobsCreateInput): Promise<Jobs> {
    return prisma.jobs.create({ data });
  }

  async update(id: number, data: Prisma.JobsUpdateInput): Promise<Jobs> {
    return prisma.jobs.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<void> {
    await prisma.jobs.delete({ where: { id } });
  }
}
