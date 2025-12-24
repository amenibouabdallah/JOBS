import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { CreateParticipantAdminDto } from './dto/create-participant-admin.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UploadsService } from '../uploads/uploads.service'; // Import UploadsService
import { MAX_FILE_SIZE } from '../uploads/uploads.utils'; // Import MAX_FILE_SIZE

@Controller('participant')
export class ParticipantController {
  constructor(
    private participantService: ParticipantService,
    private readonly uploadsService: UploadsService, // Inject UploadsService
  ) {}

  @Patch('profile/password')
  async updatePassword(
    @CurrentUser('sub') userId: number,
    @Body() updatePasswordDto: { password: string },
  ) {
    return this.participantService.updatePassword(userId, updatePasswordDto.password);
  }

  @Post('upload-profile-image')
  @Public()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadProfileImage(@CurrentUser('sub') userId: number, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.uploadsService.uploadFile(file, 'profiles', /\/(jpg|jpeg|png|gif)$/);
    await this.participantService.updateProfileImage(userId, imageUrl);
    return { 
      url: imageUrl,
      filename: file.filename 
    };
  }

  @Get('profile')
  @Roles(UserRole.PARTICIPANT)
  async getProfile(@CurrentUser('sub') userId: number) {
    return this.participantService.findProfileByUserId(userId);
  }

  @Patch('profile')
  @Roles(UserRole.PARTICIPANT)
  async updateProfile(
    @CurrentUser('sub') userId: number,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ) {
    return this.participantService.updateProfile(userId, updateParticipantDto);
  }

  // Admin routes
  @Get()
  @Roles(UserRole.ADMIN)
  async getAllParticipants() {
    return this.participantService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createParticipantAsAdmin(@Body() createParticipantDto: CreateParticipantAdminDto) {
    return this.participantService.createParticipantAsAdmin(createParticipantDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.JE)
  async updateParticipant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParticipantDto: UpdateParticipantDto,
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: UserRole
  ) {
    return this.participantService.update(id, updateParticipantDto, userId, role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteParticipant(@Param('id', ParseIntPipe) id: number) {
    return this.participantService.delete(id);
  }

  // Public registration
  @Post('register')
  @Public()
  async register(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantService.register(createParticipantDto);
  }

  // Other routes
  @Get('je')
  @Roles(UserRole.JE)
  async getJeParticipants(@CurrentUser('sub') userId: number) {
    return this.participantService.findParticipantsByJeUserId(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.JE)
  async getParticipant(@Param('id', ParseIntPipe) id: number) {
    return this.participantService.findById(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.JE)
  async approveParticipant(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number
  ) {
    return this.participantService.approve(id, userId);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.JE)
  async getParticipantByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.participantService.findByUserId(userId);
  }

  @Patch(':id/payment')
  @Roles(UserRole.ADMIN)
  async toggleParticipantPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { paid: boolean },
  ) {
    return this.participantService.toggleParticipantPaymentAdmin(id, body.paid);
  }
}