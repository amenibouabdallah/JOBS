import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JeService } from '../je/je.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export interface AdminCreateJEDto {
  name: string;
  email: string;
  phone?: string;
  generateCredentials?: boolean;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly jeService: JeService, private readonly adminService: AdminService) {}

  @Get('profile')
  @Roles(UserRole.ADMIN)
  async getProfile(@CurrentUser('sub') userId: number) {
    return this.adminService.getProfile(userId);
  }

  @Get('reports')
  @Roles(UserRole.ADMIN)
  async getReports() {
    return this.adminService.getReports();
  }

  @Patch('profile')
  @Roles(UserRole.ADMIN)
  async updateProfile(@CurrentUser('sub') userId: number, @Body() updateData: any) {
    return this.adminService.updateProfile(userId, updateData);
  }

  @Get('jes')
  @Roles(UserRole.ADMIN)
  async getAllJEs() {
    return this.jeService.findAll();
  }

  @Post('jes')
  @Roles(UserRole.ADMIN)
  async createJE(@Body() createJeDto: AdminCreateJEDto) {
    try {
      const result = await this.jeService.create({
        name: createJeDto.name,
        email: createJeDto.email,
        phone: createJeDto.phone,
        code: undefined // Will be auto-generated
      });
      
      const credentials = createJeDto.generateCredentials ? {
        email: result.user.email,
        password: result.tempPassword,
        code: result.je.code,
      } : undefined;
      
      // Remove tempPassword from the JE object before returning
      const { tempPassword, ...jeData } = result;
      
      return {
        je: jeData,
        credentials,
        message: 'JE créée avec succès'
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création de la JE: ${error.message}`);
    }
  }

  @Delete('jes/:id')
  @Roles(UserRole.ADMIN)
  async deleteJE(@Param('id') id: string) {
    const jeId = parseInt(id);
    await this.jeService.remove(jeId);
    return { message: 'JE supprimée avec succès' };
  }

  @Post('jes/generate-script')
  @Roles(UserRole.ADMIN)
  async generateJEsFromScript() {
    try {
      // Execute the generation script
      const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'generate-jes.ts');
      const { stdout, stderr } = await execAsync(`npx ts-node ${scriptPath}`);
      
      if (stderr && !stderr.includes('experimental')) {
        console.error('Script error:', stderr);
        throw new Error('Erreur lors de l\'exécution du script');
      }

      // Parse the output to get generated credentials
      const output = stdout.toString();
      const lines = output.split('\n');
      
      let credentialsCount = 0;
      const credentials = [];
      
      // Extract credentials from script output
      for (const line of lines) {
        if (line.includes('Generated credentials')) {
          credentialsCount++;
        }
        if (line.includes('Email:') || line.includes('Password:') || line.includes('Code:')) {
          // Parse credentials from output if needed
        }
      }

      // Refresh and return the updated JE list
      const updatedJEs = await this.jeService.findAll();
      
      return {
        message: `${credentialsCount} JE(s) générée(s) avec succès`,
        count: credentialsCount,
        jes: updatedJEs
      };
    } catch (error) {
      console.error('Error executing generation script:', error);
      throw new Error(`Erreur lors de la génération: ${error.message}`);
    }
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getAdminStats() {
    const jes = await this.jeService.findAll();
    
    const totalJEs = jes.length;
    const approvedJEs = jes.filter(je => je.user.status === 'APPROVED').length;
    const totalParticipants = jes.reduce((sum, je) => sum + je._count.participants, 0);
    const pendingJEs = totalJEs - approvedJEs;

    return {
      totalJEs,
      approvedJEs,
      pendingJEs,
      totalParticipants,
    };
  }

  
}
