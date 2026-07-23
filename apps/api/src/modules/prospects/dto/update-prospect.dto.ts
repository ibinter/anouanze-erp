import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutProspect } from '@prisma/client';

export class ChangerStatutProspectDto {
  @ApiProperty({ enum: StatutProspect })
  @IsEnum(StatutProspect, { message: 'Statut de prospect inconnu' })
  statut: StatutProspect;

  @ApiPropertyOptional({ description: 'Note ajoutée au journal du prospect' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class AjouterNoteProspectDto {
  @ApiProperty({ example: 'Appel du 24/07 : démo programmée le 30/07.' })
  @IsString()
  @MaxLength(2000)
  note: string;
}
