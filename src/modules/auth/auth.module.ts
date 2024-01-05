import { Module } from '@nestjs/common';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { LinkedInOAuthController } from './controllers/linkedin-oauth.controller';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { MicrosodtOAuthController } from './controllers/microsoft-oauth.controller';

@Module({
  imports: [],
  controllers: [
    GoogleOAuthController,
    LinkedInOAuthController,
    MicrosodtOAuthController,
  ],
  providers: [GoogleStrategy, LinkedInStrategy, MicrosoftStrategy],
})
export class AuthModule {}
