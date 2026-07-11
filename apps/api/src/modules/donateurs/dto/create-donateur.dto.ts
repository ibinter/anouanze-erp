import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDonateurDto {
  @ApiPropertyOptional({ default: 'PHYSIQUE' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  adresse?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;
}
