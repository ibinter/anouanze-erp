import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateImmobilisationDto {
  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsString()
  designation: string;

  @ApiProperty({ example: 'MATERIEL' })
  @IsString()
  categorie: string;

  @ApiProperty()
  @IsDateString()
  dateAcquisition: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  valeurAcquisition: number;

  @ApiPropertyOptional({ description: 'Durée de vie en mois' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  dureeVie?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  tauxAmortissement?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  valeurResiduelle?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  localisation?: string;
}
