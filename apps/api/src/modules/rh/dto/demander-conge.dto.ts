import { IsString, IsDateString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DemanderCongeDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsDateString()
  dateDebut: string;

  @ApiProperty()
  @IsDateString()
  dateFin: string;

  @ApiProperty()
  @IsInt()
  nombreJours: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motif?: string;
}
