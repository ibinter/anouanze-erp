import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnvoyerNotificationDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'IDs utilisateurs destinataires. Vide = toute l\'org.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  destinatairesIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lien?: string;
}
