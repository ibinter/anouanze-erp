import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangerMotDePasseDto {
  @ApiProperty()
  @IsString()
  ancienMotDePasse: string;

  @ApiProperty({ description: 'Doit respecter la politique de mot de passe (12 caractères minimum)' })
  @IsString()
  @MinLength(12)
  nouveauMotDePasse: string;
}
