import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateIndicateurDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'personnes bénéficiaires' })
  @IsString()
  unite: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  valeurCible: number;

  @ApiPropertyOptional({ example: 'MENSUELLE' })
  @IsString()
  @IsOptional()
  frequenceCollecte?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  methodologie?: string;
}
