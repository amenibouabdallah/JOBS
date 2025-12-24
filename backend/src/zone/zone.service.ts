import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '../lib/prisma';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Injectable()
export class ZoneService {
  constructor() {}

  async create(createZoneDto: CreateZoneDto) {
    return prisma.zone.create({
      data: createZoneDto,
    });
  }

  async findAll() {
    return prisma.zone.findMany({
      include: {
        jes: {
          select: {
            id: true,
            name: true,
            code: true,
            _count: {
              select: { participants: true }
            }
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        jes: {
          include: {
            participants: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                placeName: true,
                payDate: true,
                firstPayDate: true,
                role: true,
              },
              orderBy: {
                lastName: 'asc',
              }
            }
          }
        }
      }
    });

    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    return zone;
  }

  async update(id: number, updateZoneDto: UpdateZoneDto) {
    return prisma.zone.update({
      where: { id },
      data: updateZoneDto,
    });
  }

  async remove(id: number) {
    return prisma.zone.delete({
      where: { id },
    });
  }

  async assignJe(zoneId: number, jeId: number) {
    // First check if zone exists
    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone) throw new NotFoundException('Zone not found');

    // Check if JE exists
    const je = await prisma.jE.findUnique({ where: { id: jeId } });
    if (!je) throw new NotFoundException('JE not found');

    // Assign JE to Zone
    return prisma.jE.update({
      where: { id: jeId },
      data: { reservedZoneId: zoneId },
    });
  }

  async unassignJe(jeId: number) {
    return prisma.jE.update({
      where: { id: jeId },
      data: { reservedZoneId: null },
    });
  }

  async reserveZone(zoneId: number, jeId: number) {
    // Check if zone exists
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: { jes: true }
    });
    
    if (!zone) throw new NotFoundException('Zone not found');

    // Check if zone is available (not reserved by anyone else)
    // Assuming a zone can only be reserved by ONE JE for now based on "blocked" requirement
    if (zone.jes.length > 0 && !zone.jes.some(j => j.id === jeId)) {
      throw new BadRequestException('Zone is already reserved by another JE');
    }

    // Update JE to reserve this zone
    // This automatically unassigns them from any previous zone
    return prisma.jE.update({
      where: { id: jeId },
      data: { reservedZoneId: zoneId },
    });
  }

  // Auto-generate zones A, A', B, B'...
  async generateZones(count: number) {
    const zones = [];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < count; i++) {
      const letterIndex = Math.floor(i / 2);
      if (letterIndex >= letters.length) break; // Limit to Z for now
      
      const letter = letters[letterIndex];
      const isPrime = i % 2 !== 0;
      const name = isPrime ? `${letter}'` : letter;

      // Check if exists
      const exists = await prisma.zone.findFirst({ where: { name } });
      if (!exists) {
        zones.push(await prisma.zone.create({
          data: { name }
        }));
      }
    }
    return zones;
  }

  async getJePaidParticipantsCount(jeId: number) {
    return prisma.participant.count({
      where: {
        jeId,
        payDate: { not: null },
      }
    });
  }

  async getJeReservedPlaces(jeId: number) {
    const participants = await prisma.participant.findMany({
      where: {
        jeId,
        placeName: { not: null }
      },
      select: {
        placeName: true
      }
    });
    return participants.map(p => p.placeName);
  }

  async reservePlace(userId: number, placeNumber: number) {
    // 1. Get Participant and their JE
    const participant = await prisma.participant.findFirst({
      where: { userId },
      include: { je: { include: { reservedZone: true } } }
    });

    if (!participant) throw new NotFoundException('Participant not found');
    if (!participant.je) throw new BadRequestException('Participant does not belong to a JE');
    if (!participant.je.reservedZone) throw new BadRequestException('JE has not reserved a zone yet');

    // 2. Check payment status
    if (!participant.payDate && !participant.firstPayDate) {
      throw new BadRequestException('You must pay to reserve a place');
    }

    // 3. Validate place number limit
    const paidCount = await this.getJePaidParticipantsCount(participant.je.id);
    if (placeNumber < 1 || placeNumber > paidCount) {
      throw new BadRequestException(`Invalid place number. Must be between 1 and ${paidCount}`);
    }

    // 4. Construct Place Name
    const placeName = `${participant.je.reservedZone.name}_${placeNumber}`;

    // 5. Check availability (Global check or JE check? "JE zone Name"_'number' implies uniqueness if Zone is unique to JE)
    // If multiple JEs share a zone, we might have collisions if we don't include JE name.
    // But the requirement says "JE zone Name"_'number'.
    // If Zone A is assigned to JE1. Place is A_1.
    // If Zone A is assigned to JE2. Place is A_1.
    // Collision!
    // I will assume Zone is exclusive or I should check if anyone in THIS ZONE has this place name.
    // Actually, if the place name is just "A_1", it collides.
    // I will check if any participant has this placeName.
    
    const existing = await prisma.participant.findFirst({
      where: {
        placeName,
        // Optional: Scope to the same zone? 
        // If placeName includes Zone Name, it is scoped to Zone.
        // So we just check global uniqueness of this string.
      }
    });

    if (existing && existing.id !== participant.id) {
      throw new BadRequestException(`Place ${placeName} is already taken`);
    }

    // 6. Save
    return prisma.participant.update({
      where: { id: participant.id },
      data: { placeName }
    });
  }
  
  async getExportData() {
    const participants = await prisma.participant.findMany({
      where: {
        placeName: { not: null }
      },
      select: {
        firstName: true,
        lastName: true,
        placeName: true,
        je: {
          select: {
            name: true,
            reservedZone: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    return participants;
  }

  async getParticipantWithJe(userId: number) {
    return prisma.participant.findFirst({
      where: { userId },
      include: { je: { include: { reservedZone: true } } }
    });
  }

  async reserveZoneForUser(zoneId: number, userId: number) {
    const je = await prisma.jE.findFirst({ where: { userId } });
    if (!je) throw new BadRequestException('JE profile not found');
    return this.reserveZone(zoneId, je.id);
  }
}
