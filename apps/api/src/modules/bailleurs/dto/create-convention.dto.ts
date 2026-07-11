import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Devise } from '@prisma/client';

export class CreateConventionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projetId?: string;

  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty()
  @IsNumber()
  montantTotal: number;

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;

  @ApiProperty()
  @IsDateString()
  dateSignature: string;

  @ApiProperty()
  @IsDateString()
  dateDebut: string;

  @ApiProperty()
  @IsDateString()
  dateFin: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  rapportsPrevus?: Record<string, unknown>;
}
