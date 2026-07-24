import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PeriodiciteAbonnement, StatutAbonnement, StatutFacture } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ChangerPlanDto {
  @ApiProperty({ example: 'PRO', description: 'Code du plan cible' })
  @IsString()
  codePlan!: string;

  @ApiPropertyOptional({ enum: PeriodiciteAbonnement })
  @IsOptional()
  @IsEnum(PeriodiciteAbonnement)
  periodicite?: PeriodiciteAbonnement;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  renouvellementAuto?: boolean;

  @ApiPropertyOptional({ description: "Organisation ciblée (SUPER_ADMIN uniquement)" })
  @IsOptional()
  @IsString()
  organisationId?: string;
}

export class UpdateAbonnementDto {
  @ApiPropertyOptional({ enum: StatutAbonnement })
  @IsOptional()
  @IsEnum(StatutAbonnement)
  statut?: StatutAbonnement;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  renouvellementAuto?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GenererFactureDto {
  @ApiPropertyOptional({ description: 'Nombre de jours avant échéance', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  delaiEcheanceJours?: number;

  @ApiPropertyOptional({ description: 'Émettre la facture immédiatement (sinon BROUILLON)' })
  @IsOptional()
  @IsBoolean()
  emettre?: boolean;
}

export class ChangerStatutFactureDto {
  @ApiProperty({ enum: StatutFacture })
  @IsEnum(StatutFacture)
  statut!: StatutFacture;

  @ApiPropertyOptional({ example: 'VIREMENT' })
  @IsOptional()
  @IsString()
  modePaiement?: string;
}
