import { Module } from '@nestjs/common';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { LinkedInOAuthController } from './controllers/linkedin-oauth.controller';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { MicrosoftOAuthController } from './controllers/microsoft-oauth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { OAuthCallbackInterceptor } from './interceptors/oauth-callback.interceptor';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    UsersModule,
  ],
  controllers: [
    AuthController,
    GoogleOAuthController,
    LinkedInOAuthController,
    MicrosoftOAuthController,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    GoogleStrategy,
    LinkedInStrategy,
    MicrosoftStrategy,
    OAuthCallbackInterceptor,
  ],
})
export class AuthModule {}
