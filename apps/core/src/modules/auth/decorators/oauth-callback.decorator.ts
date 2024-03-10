import { SetMetadata } from '@nestjs/common';

export const OAuthCallback = () => SetMetadata('oauthCallback', true);
