import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleUtilisateur } from '@prisma/client';

export class ChangerRoleDto {
  @ApiProperty({ enum: RoleUtilisateur })
  @IsEnum(RoleUtilisateur, { message: 'Rôle inconnu' })
  role: RoleUtilisateur;
}
