import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Devise } from '@prisma/client';

export class CreateCompteBancaireDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  banque: string;

  @ApiProperty()
  @IsString()
  numeroCompte: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional({ enum: Devise })
  @IsOptional()
  @IsEnum(Devise)
  devise?: Devise;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  soldeInitial?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
