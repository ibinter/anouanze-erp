import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class HistoriqueMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatMessageDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [HistoriqueMessageDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HistoriqueMessageDto)
  historique?: HistoriqueMessageDto[];
}
