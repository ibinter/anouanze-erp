import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsPositive,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeProjet, StatutProjet, Devise } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TypeProjet })
  @IsOptional()
  @IsEnum(TypeProjet)
  type?: TypeProjet;

  @ApiPropertyOptional({ enum: StatutProjet })
  @IsOptional()
  @IsEnum(StatutProjet)
  statut?: StatutProjet;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projetParentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  budgetTotal?: number;

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zones?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secteurs?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectifs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  indicateurs?: Record<string, unknown>;
}
