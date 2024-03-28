import { OAuthIntegrationType } from '@/core/modules/users/schemas/user-integration.schema';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsUUID()
  @IsOptional()
  inviteToken: string;

  @IsString()
  type: OAuthIntegrationType;

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken?: string;
}
