import { OAuthIntegrationType } from '@/core/modules/users/schemas/user-integration.schema';

export class OAuthCallbackDto {
  firstname: string;

  lastname: string;

  email: string;

  picture?: string;

  type: OAuthIntegrationType;

  accessToken: string;

  refreshToken?: string;
}
