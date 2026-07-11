import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeCompte } from '@prisma/client';

export class CreateCompteDto {
  @ApiProperty()
  @IsString()
  numero: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty({ enum: TypeCompte })
  @IsEnum(TypeCompte)
  typeCompte: TypeCompte;

  @ApiPropertyOptional({ default: 'DEBITEUR' })
  @IsOptional()
  @IsString()
  sens?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  compteParentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
