import { IsString, IsNumber, IsEmail, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TypePaiement {
  DON = 'DON',
  COTISATION = 'COTISATION',
}

/**
 * Canal souhaité par le payeur. CinetPay étant un agrégateur, le choix d'un
 * opérateur mobile précis se traduit par le canal `MOBILE_MONEY` : c'est la
 * page CinetPay qui présente ensuite Orange Money / MTN / Moov / Wave.
 */
export enum OperateurPaiement {
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MOMO = 'MTN_MOMO',
  MOOV_MONEY = 'MOOV_MONEY',
  WAVE = 'WAVE',
  CINETPAY = 'CINETPAY',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
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

  @ApiPropertyOptional({
    enum: OperateurPaiement,
    description:
      "Canal souhaité. Purement indicatif : la sélection finale de l'opérateur se fait sur la page CinetPay.",
  })
  @IsOptional()
  @IsEnum(OperateurPaiement)
  operateur?: OperateurPaiement;
}
