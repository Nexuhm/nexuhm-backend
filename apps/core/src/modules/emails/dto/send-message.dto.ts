import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  subject: string;

  @IsString()
  @MinLength(3)
  @MaxLength(40)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(100)
  @MaxLength(1000)
  message: string;
}
