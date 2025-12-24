import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ActivityService } from './activity.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('activities')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('my-program/pdf')
  @Roles(UserRole.PARTICIPANT)
  async downloadMyProgram(@CurrentUser('sub') userId: number, @Res() res: Response) {
    const filePath = await this.activityService.generateMyProgramPDF(userId);
    res.download(filePath);
  }

  @Get()
  @Roles(UserRole.PARTICIPANT, UserRole.JE, UserRole.ADMIN)
  async getActivities() {
    return this.activityService.getActivities();
  }


  @Post(':id/select')
  @Roles(UserRole.PARTICIPANT)
  async selectActivity(@CurrentUser('sub') userId: number, @Param('id', ParseIntPipe) activityId: number) {
    return this.activityService.selectActivity(userId, activityId);
  }

  @Delete(':id/select')
  @Roles(UserRole.PARTICIPANT)
  async deselectActivity(@CurrentUser('sub') userId: number, @Param('id', ParseIntPipe) activityId: number) {
    return this.activityService.deselectActivity(userId, activityId);
  }

  // Fetch my selected program
  @Get('me')
  @Roles(UserRole.PARTICIPANT)
  async getMyProgram(@CurrentUser('sub') userId: number) {
    return this.activityService.getMyProgram(userId);
  }

  // Admin management
  @Get('admin/list')
  @Roles(UserRole.ADMIN)
  listAdmin() {
    return this.activityService.listForAdmin();
  }

  @Get('admin/program')
  @Roles(UserRole.ADMIN)
  getProgram() {
    return this.activityService.getProgram();
  }

  @Post('admin')
  @Roles(UserRole.ADMIN)
  create(@Body() body: { name: string; description?: string; startTime: Date; endTime: Date; capacity?: number; panelists?: string[]; isRequired?: boolean; requiredForRoles?: UserRole[]; activityTypeId: number; salleId: number; supportId?: number }) {
    return this.activityService.createActivity(body);
  }

  @Patch('admin/:id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; description?: string | null; startTime?: Date; endTime?: Date; capacity?: number; panelists?: string[]; isRequired?: boolean; requiredForRoles?: UserRole[]; activityTypeId?: number; salleId?: number; supportId?: number }) {
    return this.activityService.updateActivity(id, body);
  }

  @Delete('admin/:id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.deleteActivity(id);
  }

  // Correlations
  @Get('admin/correlations')
  @Roles(UserRole.ADMIN)
  listCorrelations() {
    return this.activityService.listCorrelations();
  }

  @Post('admin/correlations')
  @Roles(UserRole.ADMIN)
  addCorrelation(@Body() body: { sourceActivityId: number; targetActivityId: number; rule: 'REQUIRES' | 'EXCLUDES' | 'ALL'; description?: string; autoPickForRoles?: string[]; role?: string }) {
    return this.activityService.addCorrelation(body);
  }

  @Delete('admin/correlations/:id')
  @Roles(UserRole.ADMIN)
  removeCorrelation(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.removeCorrelation(id);
  }

  @Post('ensure-required')
  @Roles(UserRole.PARTICIPANT)
  ensureRequired(@CurrentUser('sub') userId: number) {
    return this.activityService.ensureRequiredSelectionsForParticipant(userId);
  }

  @Post('program')
  @Roles(UserRole.PARTICIPANT)
  updateProgram(@CurrentUser('sub') userId: number, @Body() body: { activityIds: number[] }) {
    return this.activityService.updateProgram(userId, body.activityIds);
  }
}
