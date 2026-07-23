import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangerStatutDto {
  @ApiProperty({ description: "Activer (true) ou désactiver (false) l'accès du membre à l'organisation" })
  @IsBoolean()
  actif: boolean;
}
