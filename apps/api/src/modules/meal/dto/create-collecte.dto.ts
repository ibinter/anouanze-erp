import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateCollecteDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  valeur: number;

  @ApiProperty()
  @IsDateString()
  dateCollecte: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  commentaire?: string;
}
