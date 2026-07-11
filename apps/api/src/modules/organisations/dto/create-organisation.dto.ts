import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeOrganisation, Devise } from '@prisma/client';

export class CreateOrganisationDto {
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sigle?: string;

  @ApiProperty({ enum: TypeOrganisation })
  @IsEnum(TypeOrganisation)
  type: TypeOrganisation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateCreation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroRecepisse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroImmatriculation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mission?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vision?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  valeurs?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siege?: string;

  @ApiPropertyOptional()
  @IsOptional()
  adresseComplete?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siteWeb?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couleurPrimaire?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couleurSecondaire?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secteurs?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paysPrincipal?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paysIntervention?: string[];

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  deviseDefaut?: Devise;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languesActives?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  exerciceComptableDebut?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  exerciceComptableFin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
