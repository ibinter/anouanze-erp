import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommandeDto {
  @ApiProperty()
  @IsString()
  fournisseurId: string;

  @ApiProperty()
  @IsString()
  numero: string;

  @ApiProperty()
  @IsDateString()
  dateCommande: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateLivraison?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  montantTotal: number;

  @ApiPropertyOptional({ default: 'XOF' })
  @IsOptional()
  @IsString()
  devise?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
