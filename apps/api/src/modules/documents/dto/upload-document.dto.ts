import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatutDocument } from '@prisma/client';

export class UploadDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: StatutDocument })
  @IsOptional()
  @IsEnum(StatutDocument)
  statut?: StatutDocument;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentParentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateExpiration?: string;
}
