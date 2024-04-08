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
import { JwtStrategy } from './strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from './schemas/password-reset-token.schema';
import { PasswordResetService } from './services/password-reset.service';
import { PasswordResetController } from './controllers/password-reset.controller';
import { EmailsModule } from '../emails/emails.module';
import { CompanyModule } from '../company/company.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: PasswordResetToken.name,
        useFactory: () => PasswordResetTokenSchema,
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    UsersModule,
    TeamModule,
    CompanyModule,
    EmailsModule,
  ],
  controllers: [
    AuthController,
    GoogleOAuthController,
    LinkedInOAuthController,
    MicrosoftOAuthController,
    PasswordResetController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    LinkedInStrategy,
    MicrosoftStrategy,
    OAuthCallbackInterceptor,
    PasswordResetService,
  ],
})
export class AuthModule {}
