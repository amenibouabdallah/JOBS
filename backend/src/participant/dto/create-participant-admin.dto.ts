import { IsString, IsOptional, IsInt, IsDate, IsEnum, IsEmail } from 'class-validator';
import { ParticipantRole } from '@prisma/client';

export class CreateParticipantAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  password;

  @IsEnum(ParticipantRole)
  role: ParticipantRole;

  @IsInt()
  @IsOptional()
  privacy?: number;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  sexe?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDate()
  @IsOptional()
  birthdate?: Date;

  @IsString()
  @IsOptional()
  linkedinLink?: string;

  @IsString()
  @IsOptional()
  cinPassport?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsInt()
  jeId: number;
}
