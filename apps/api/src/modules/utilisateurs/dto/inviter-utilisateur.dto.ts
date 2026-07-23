import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleUtilisateur } from '@prisma/client';

export class InviterUtilisateurDto {
  @ApiProperty({ example: 'coordination@ong.ci' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ enum: RoleUtilisateur })
  @IsEnum(RoleUtilisateur, { message: 'Rôle inconnu' })
  role: RoleUtilisateur;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  prenom?: string;
}
