import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SalleService } from './salle.service';

@Controller('salles')
export class SalleController {
  constructor(private service: SalleService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.JE, UserRole.PARTICIPANT)
  list() {
    return this.service.list();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: { name: string; description?: string; capacity: number; type?: string }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string | null; capacity?: number; type?: string },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
