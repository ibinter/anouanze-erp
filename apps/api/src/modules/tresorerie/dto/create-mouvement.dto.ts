import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMouvementDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  libelle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  debit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  credit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  rapproche?: boolean;
}
