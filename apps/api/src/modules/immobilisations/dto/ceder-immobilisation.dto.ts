import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CederImmobilisationDto {
  @ApiProperty()
  @IsDateString()
  dateCession: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  prixCession: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  acquereur?: string;
}
