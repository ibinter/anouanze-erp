import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEvenementDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'AG, REUNION, FORMATION, ATELIER, CONFERENCE' })
  @IsString()
  type: string;

  @ApiProperty()
  @IsDateString()
  dateDebut: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lieu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lienVisio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  capaciteMax?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  inscription?: boolean;
}
