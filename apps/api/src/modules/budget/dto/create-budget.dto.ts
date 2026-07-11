import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Devise } from '@prisma/client';

export class LigneBudgetDto {
  @ApiProperty()
  @IsString()
  categorie: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  montantPrevu: number;

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;
}

export class CreateBudgetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projetId?: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  exercice: number;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiProperty({ type: [LigneBudgetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneBudgetDto)
  lignes: LigneBudgetDto[];
}
