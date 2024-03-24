import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID } from 'class-validator';

export class PasswordResetDto {
  @ApiProperty()
  @IsUUID()
  token: string;

  @ApiProperty()
  @IsString()
  newPassword: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;
}

export class CreatePasswordResetTokenDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
