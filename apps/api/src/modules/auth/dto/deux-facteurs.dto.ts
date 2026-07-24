import { IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Confirmation d'activation : premier code TOTP affiché par l'application. */
export class ConfirmerDeuxFacteursDto {
  @ApiProperty({ example: '123456', description: 'Code à 6 chiffres' })
  @IsString()
  @Length(6, 6)
  code: string;
}

/** Désactivation / régénération des codes de secours : mot de passe courant exigé. */
export class MotDePasseCourantDto {
  @ApiProperty({ example: '••••••••••••' })
  @IsString()
  @MinLength(1)
  motDePasse: string;
}
