import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeCotisation, StatutPaiement } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateCotisationDto {
  @ApiProperty()
  @IsString()
  periode: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  montant: number;

  @ApiProperty({ enum: TypeCotisation })
  @IsEnum(TypeCotisation)
  typeCotisation: TypeCotisation;

  @ApiPropertyOptional({ enum: StatutPaiement })
  @IsOptional()
  @IsEnum(StatutPaiement)
  statut?: StatutPaiement;

  @ApiProperty()
  @IsDateString()
  dateEcheance: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  datePaiement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modePaiement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
