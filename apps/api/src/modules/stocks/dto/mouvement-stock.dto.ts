import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MouvementStockDto {
  @ApiProperty({ minimum: 0.0001 })
  @IsNumber()
  @Min(0.0001)
  quantite: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motif?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}
