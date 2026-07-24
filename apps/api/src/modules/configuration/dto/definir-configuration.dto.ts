import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class DefinirConfigurationDto {
  @ApiProperty({
    description:
      "Valeur en clair de la clé. Elle est chiffrée avant stockage si la clé est secrète, et n'est jamais relue par l'API.",
  })
  @IsString({ message: 'La valeur doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'La valeur ne peut pas être vide.' })
  @MaxLength(4096, { message: 'La valeur ne peut pas dépasser 4096 caractères.' })
  valeur!: string;
}
