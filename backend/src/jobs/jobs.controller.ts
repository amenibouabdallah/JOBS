import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, Prisma } from '@prisma/client';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private service: JobsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.JE, UserRole.PARTICIPANT)
  list() {
    return this.service.list();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: Prisma.JobsCreateInput) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Prisma.JobsUpdateInput,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
