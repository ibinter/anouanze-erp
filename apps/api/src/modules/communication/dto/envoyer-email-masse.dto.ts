import { IsString, IsArray, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnvoyerEmailMasseDto {
  @ApiProperty()
  @IsString()
  sujet: string;

  @ApiProperty()
  @IsString()
  contenuHtml: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsEmail({}, { each: true })
  destinataires: string[];
}
