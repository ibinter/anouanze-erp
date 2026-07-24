import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'PRO' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Pro' })
  @IsString()
  nom!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 59900 })
  @IsNumber()
  @Min(0)
  prixMensuel!: number;

  @ApiProperty({ example: 599000 })
  @IsNumber()
  @Min(0)
  prixAnnuel!: number;

  @ApiPropertyOptional({ description: 'null = utilisateurs illimités' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUtilisateurs?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modulesInclus?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  surDevis?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  ordre?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
