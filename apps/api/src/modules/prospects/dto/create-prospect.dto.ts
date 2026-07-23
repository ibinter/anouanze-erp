import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Demande de démonstration déposée depuis la landing page.
 * Route **publique** : aucun champ de confiance (statut, relances…) n'est accepté.
 */
export class CreateProspectDto {
  @ApiProperty({ example: 'Kouassi' })
  @IsString()
  @MaxLength(120)
  nom: string;

  @ApiPropertyOptional({ example: 'Awa' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  prenom?: string;

  @ApiProperty({ example: 'contact@ong-exemple.ci' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiPropertyOptional({ example: '+225 07 00 00 00 00' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  telephone?: string;

  @ApiPropertyOptional({ example: 'ONG Exemple' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  organisation?: string;

  @ApiPropertyOptional({ example: 'Directrice exécutive' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fonction?: string;

  @ApiPropertyOptional({ example: 'CI' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  pays?: string;

  @ApiPropertyOptional({ example: 'sante' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  secteur?: string;

  @ApiPropertyOptional({ example: '10-50 salariés' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tailleStructure?: string;

  @ApiPropertyOptional({ example: 'Suivi comptable SYCEBNL et gestion des projets' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  besoin?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  nbUtilisateurs?: number;

  @ApiPropertyOptional({ example: '2026-08-01T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dateSouhaitee?: string;

  @ApiPropertyOptional({ example: 'site-web' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @ApiPropertyOptional({ example: true, description: 'Consentement au traitement des données' })
  @IsOptional()
  @IsBoolean()
  consentement?: boolean;
}
