import { IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenererFichePaieDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  primes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deductions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cotisationsSociales?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  impots?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  datePaiement?: string;
}
