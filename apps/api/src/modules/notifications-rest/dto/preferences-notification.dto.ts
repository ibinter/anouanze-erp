import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CanalNotification } from '@prisma/client';

export class PreferenceNotificationItemDto {
  @ApiProperty({ enum: CanalNotification })
  @IsEnum(CanalNotification, { message: 'Canal inconnu (EMAIL ou APPLICATION)' })
  canal: CanalNotification;

  @ApiProperty({ example: 'budget-seuil' })
  @IsString()
  @MaxLength(80)
  typeEvenement: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  actif: boolean;
}

export class MajPreferencesNotificationDto {
  @ApiProperty({ type: [PreferenceNotificationItemDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PreferenceNotificationItemDto)
  preferences: PreferenceNotificationItemDto[];
}
