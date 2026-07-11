import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangerMotDePasseDto {
  @ApiProperty()
  @IsString()
  ancienMotDePasse: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  nouveauMotDePasse: string;
}
