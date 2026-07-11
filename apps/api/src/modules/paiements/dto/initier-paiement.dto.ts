import { IsString, IsNumber, IsEmail, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TypePaiement {
  DON = 'DON',
  COTISATION = 'COTISATION',
}

export class InitierPaiementDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  montant: number;

  @ApiProperty({ default: 'XOF' })
  @IsString()
  devise: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEmail()
  payeurEmail: string;

  @ApiProperty()
  @IsString()
  payeurTel: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donateurId?: string;

  @ApiProperty({ enum: TypePaiement })
  @IsEnum(TypePaiement)
  type: TypePaiement;
}
