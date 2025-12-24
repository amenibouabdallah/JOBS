import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { ActivityTypeService } from './activity-type.service';

@Controller('activity-types')
export class ActivityTypeController {
  constructor(private service: ActivityTypeService) {}

  @Public()
  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: { name: string; description?: string; earliestTime?: Date; latestTime?: Date; day: 'J_1' | 'J_2' }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string | null; earliestTime?: Date; latestTime?: Date; day?: 'J_1' | 'J_2' },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
