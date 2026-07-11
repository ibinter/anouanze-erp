import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeJournal } from '@prisma/client';

export class CreateJournalDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty({ enum: TypeJournal })
  @IsEnum(TypeJournal)
  type: TypeJournal;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
