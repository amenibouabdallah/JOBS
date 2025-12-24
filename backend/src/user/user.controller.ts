import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserStatus } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Public endpoint for fetching user during registration
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.userService.updateStatus(+id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
