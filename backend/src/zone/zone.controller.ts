import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zoneService.create(createZoneDto);
  }

  @Post('generate')
  @Roles(UserRole.ADMIN)
  generate(@Body('count') count: number) {
    return this.zoneService.generateZones(count);
  }

  @Get()
  findAll() {
    return this.zoneService.findAll();
  }

  @Get('export')
  @Roles(UserRole.ADMIN)
  async export() {
    return this.zoneService.getExportData();
  }

  @Get('my-je-stats')
  @Roles(UserRole.PARTICIPANT)
  async getMyJeStats(@Req() req) {
    const participant = await this.zoneService.getParticipantWithJe(req.user.userId);
    console.log(participant);
    if (!participant || !participant.je) return { hasJe: false };
    
    const count = await this.zoneService.getJePaidParticipantsCount(participant.je.id);
    const reservedPlaces = await this.zoneService.getJeReservedPlaces(participant.je.id);

    return {
      hasJe: true,
      jeId: participant.je.id,
      reservedZone: participant.je.reservedZone.name,
      paidCount: count,
      reservedPlaces // Array of place names or numbers
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zoneService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto) {
    return this.zoneService.update(+id, updateZoneDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.zoneService.remove(+id);
  }

  @Post(':id/assign-je')
  @Roles(UserRole.ADMIN)
  assignJe(@Param('id') id: string, @Body('jeId') jeId: number) {
    return this.zoneService.assignJe(+id, jeId);
  }

  @Post('unassign-je')
  @Roles(UserRole.ADMIN)
  unassignJe(@Body('jeId') jeId: number) {
    return this.zoneService.unassignJe(jeId);
  }

  @Post('reserve-place')
  @Roles(UserRole.PARTICIPANT)
  reservePlace(@Req() req, @Body('placeNumber') placeNumber: number) {
    return this.zoneService.reservePlace(req.user.userId, placeNumber);
  }

  @Post(':id/reserve')
  @Roles(UserRole.JE)
  async reserveZone(@Param('id') id: string, @CurrentUser('sub') userId: number) {
    return this.zoneService.reserveZoneForUser(parseInt(id), userId);
  }
}
