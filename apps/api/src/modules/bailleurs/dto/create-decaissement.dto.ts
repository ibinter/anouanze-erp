import { IsNumber, IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Devise } from '@prisma/client';

export class CreateDecaissementDto {
  @ApiProperty()
  @IsNumber()
  montant: number;

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;

  @ApiProperty()
  @IsDateString()
  dateReception: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
