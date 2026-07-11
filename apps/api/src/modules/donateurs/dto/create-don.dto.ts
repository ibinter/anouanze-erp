import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeDon, Devise, StatutPaiement } from '@prisma/client';

export class CreateDonDto {
  @ApiPropertyOptional({ enum: TypeDon, default: TypeDon.NUMERAIRE })
  @IsOptional()
  @IsEnum(TypeDon)
  type?: TypeDon;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montant?: number;

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionNature?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valeurEstimee?: number;

  @ApiProperty()
  @IsDateString()
  dateDon: string;

  @ApiPropertyOptional({ enum: StatutPaiement })
  @IsOptional()
  @IsEnum(StatutPaiement)
  statut?: StatutPaiement;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  recu?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
