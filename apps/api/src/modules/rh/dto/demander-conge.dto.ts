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

  /**
   * Optionnel : si absent, le serveur le déduit de l'intervalle
   * [dateDebut, dateFin] (bornes incluses).
   */
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  nombreJours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motif?: string;
}
