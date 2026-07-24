import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Kouassi!2026#Erp',
    description: 'Doit respecter la politique de mot de passe (12 caractères minimum)',
  })
  @IsString()
  @MinLength(12)
  motDePasse: string;

  @ApiProperty({ example: 'Kouakou' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Patrice' })
  @IsString()
  prenom: string;

  @ApiPropertyOptional({ example: '+2250102030405' })
  @IsOptional()
  @IsString()
  telephone?: string;
}
