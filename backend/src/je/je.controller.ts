import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JeService, CreateJEDto, UpdateJEDto } from './je.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';
import { UploadsService } from '../uploads/uploads.service'; // Import UploadsService
import { MAX_FILE_SIZE } from '../uploads/uploads.utils'; // Import MAX_FILE_SIZE

@Controller('je')
export class JeController {
  constructor(
    private readonly jeService: JeService,
    private readonly uploadsService: UploadsService, // Inject UploadsService
  ) {}

  @Post('upload-profile-image')
  @Roles(UserRole.JE)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadProfileImage(@CurrentUser('sub') userId: number, @UploadedFile() file: Express.Multer.File) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }

    const imageUrl = await this.uploadsService.uploadFile(file, 'profiles', /\/(jpg|jpeg|png|gif)$/);
    console.log(`[JeController] Uploaded image URL: ${imageUrl}`);
    console.log(`[JeController] Attempting to update JE user ${userId} with image URL: ${imageUrl}`);
    await this.jeService.updateProfileImage(userId, imageUrl);
    return { url: imageUrl, filename: file.filename };
  }

  @Patch('profile/password')
  @Roles(UserRole.JE)
  async updatePassword(
    @CurrentUser('sub') userId: number,
    @Body() updatePasswordDto: { password: string },
  ) {
    return this.jeService.updatePassword(userId, updatePasswordDto.password);
  }

  @Get('profile')
  @Roles(UserRole.JE)
  async getProfile(@CurrentUser('sub') userId: number) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    const profile = await this.jeService.getProfile(je.id);
    return profile;
  }

  @Patch('profile')
  @Roles(UserRole.JE)
  async updateProfile(@CurrentUser('sub') userId: number, @Body() updateData: any) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.updateProfile(je.id, updateData);
  }

  @Get('dashboard')
  @Roles(UserRole.JE)
  async getDashboard(@CurrentUser('sub') userId: number) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.getDashboardData(je.id);
  }

  @Get('participants')
  @Roles(UserRole.JE)
  async getParticipants(@CurrentUser('sub') userId: number) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    
    return this.jeService.getParticipants(je.id);
  }

  @Post('participants/:participantId/approve')
  @Roles(UserRole.JE)
  async approveParticipant(
    @CurrentUser('sub') userId: number,
    @Param('participantId') participantId: string,
  ) {
    const je = await this.jeService.findByUserId(userId);
    return this.jeService.approveParticipant(je.id, parseInt(participantId), userId);
  }

  @Patch('participants/:participantId')
  @Roles(UserRole.JE)
  async updateParticipant(
    @CurrentUser('sub') userId: number,
    @Param('participantId') participantId: string,
    @Body() updateData: any,
  ) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.updateParticipant(je.id, parseInt(participantId), updateData);
  }

  @Post('payments/sheet')
  @Roles(UserRole.JE)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_FILE_SIZE },
  }))
  async uploadPaymentSheet(@CurrentUser('sub') userId: number, @UploadedFile() file: Express.Multer.File) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    const filePath = await this.uploadsService.uploadFile(file, 'payment-sheets', /\/(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$/);
    return this.jeService.uploadPaymentSheet(je.id, { filename: file.originalname, path: filePath });
  }

  @Post('payment-sheets')
  @Roles(UserRole.JE)
  async createPaymentSheet(@CurrentUser('sub') userId: number, @Body() data: { title: string; participantIds: number[]; notes?: string }) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.createPaymentSheet(je.id, data);
  }

  @Get('payment-sheets')
  @Roles(UserRole.JE)
  async getPaymentSheets(@CurrentUser('sub') userId: number) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.getPaymentSheets(je.id);
  }

  @Get('payment-sheets/:id')
  @Roles(UserRole.JE)
  async getPaymentSheet(@CurrentUser('sub') userId: number, @Param('id') id: string) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.getPaymentSheet(je.id, parseInt(id));
  }

  @Patch('payment-sheets/:id')
  @Roles(UserRole.JE)
  async updatePaymentSheet(@CurrentUser('sub') userId: number, @Param('id') id: string, @Body() data: { title?: string; participantIds?: number[]; notes?: string }) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.updatePaymentSheet(je.id, parseInt(id), data);
  }

  @Delete('payment-sheets/:id')
  @Roles(UserRole.JE)
  async deletePaymentSheet(@CurrentUser('sub') userId: number, @Param('id') id: string) {
    const je = await this.jeService.findByUserId(userId);
    if (!je) {
      throw new BadRequestException('JE profile not found for this user');
    }
    return this.jeService.deletePaymentSheet(je.id, parseInt(id));
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.jeService.findAll();
  }

  @Get('basic')
  @Roles(UserRole.ADMIN)
  async findAllBasic() {
    return this.jeService.findAllBasic();
  }

  @Public()
  @Get('public/list')
  async findAllPublic() {
    return this.jeService.findAllForSignup();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.JE)
  async findOne(@Param('id') id: string, @CurrentUser('sub') userId: number, @CurrentUser('role') role: UserRole) {
    const jeId = parseInt(id);
    
    if (role === UserRole.JE) {
      const je = await this.jeService.findOne(jeId);
      if (je?.userId !== userId) {
        throw new BadRequestException('Access denied');
      }
    }
    
    return this.jeService.findOne(jeId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createJeDto: CreateJEDto) {
    return this.jeService.create(createJeDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.JE)
  async update(
    @Param('id') id: string, 
    @Body() updateJeDto: UpdateJEDto,
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: UserRole
  ) {
    const jeId = parseInt(id);
    
    if (role === UserRole.JE) {
      const je = await this.jeService.findOne(jeId);
      if (je?.userId !== userId) {
        throw new BadRequestException('Access denied');
      }
    }
    
    return this.jeService.update(jeId, updateJeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.jeService.remove(parseInt(id));
  }

  @Post(':id/send-credentials-email')
  @Roles(UserRole.ADMIN)
  async sendCredentialsEmail(@Param('id') id: string) {
    return this.jeService.sendCredentialsEmail(parseInt(id));
  }

  // Compat endpoint: send credentials by JE name (like legacy route)
  @Post('send-mail')
  @Roles(UserRole.ADMIN)
  async sendCredentialsByName(@Body() body: { je_name: string }) {
    if (!body.je_name) {
      throw new BadRequestException('Missing required field: je_name');
    }
    return this.jeService.sendCredentialsEmailByName(body.je_name);
  }

  @Get('by-code/:code')
  @Roles(UserRole.ADMIN, UserRole.PARTICIPANT)
  async findByCode(@Param('code') code: string) {
    return this.jeService.findByCode(code);
  }

  @Post('generate-from-script')
  @Roles(UserRole.ADMIN)
  async generateJEsFromScript() {
    return this.jeService.generateJEsFromScript();
  }

  @Post(':id/verify-code')
  async verifyJECode(@Param('id') id: string, @Body() body: { code: string }) {
    const jeId = parseInt(id);
    const isValid = await this.jeService.verifyJECode(jeId, body.code);
    return { valid: isValid };
  }
}