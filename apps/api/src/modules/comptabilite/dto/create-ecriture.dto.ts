import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LigneEcritureDto {
  @ApiProperty()
  @IsString()
  compteId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  libelle?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  debit: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  credit: number;
}

export class CreateEcritureDto {
  @ApiProperty()
  @IsString()
  journalId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projetId?: string;

  @ApiProperty()
  @IsString()
  libelle: string;

  @ApiProperty()
  @IsDateString()
  dateEcriture: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateValeur?: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  exercice: number;

  @ApiProperty()
  @IsString()
  periode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pieceJointe?: string;

  @ApiProperty({ type: [LigneEcritureDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneEcritureDto)
  lignes: LigneEcritureDto[];
}
