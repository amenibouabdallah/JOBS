
import { IsString, IsOptional, IsInt, IsDate, IsEnum } from 'class-validator';
import { ParticipantRole } from '@prisma/client';

export class UpdateParticipantDto {
  @IsEnum(ParticipantRole)
  @IsOptional()
  role?: ParticipantRole;

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
  @IsOptional()
  jeId?: number;
}
