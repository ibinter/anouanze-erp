import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeContrat, Devise } from '@prisma/client';

export class CreateEmployeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  prenom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  adresse?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty()
  @IsString()
  poste: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departement?: string;

  @ApiPropertyOptional({ enum: TypeContrat })
  @IsOptional()
  @IsEnum(TypeContrat)
  typeContrat?: TypeContrat;

  @ApiProperty()
  @IsDateString()
  dateEmbauche: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFinContrat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salaireBase?: number;

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
