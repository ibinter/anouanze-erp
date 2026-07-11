import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockDto {
  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsString()
  designation: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unite?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMinimum?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  prixUnitaire?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localisation?: string;
}
