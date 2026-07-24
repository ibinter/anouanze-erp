import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6)
  motDePasse: string;

  @ApiPropertyOptional({
    example: '123456',
    description:
      'Code de double authentification (TOTP ou code de secours). Requis uniquement si le compte a activé la 2FA.',
  })
  @IsOptional()
  @IsString()
  code?: string;
}
