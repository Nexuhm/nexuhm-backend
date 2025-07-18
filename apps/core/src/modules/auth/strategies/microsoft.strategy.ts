import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import * as jwt from 'jsonwebtoken';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      authorizationURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/microsoft/callback`,
      scope: [
        'openid',
        'profile',
        'email',
        'Calendars.Read',
        'Calendars.ReadWrite',
        'offline_access',
      ],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    __: unknown,
    done: (err: any, result: any) => void,
  ): Promise<void> {
    const data: any = jwt.decode(accessToken);

    const user: OAuthCallbackDto = {
      type: 'microsoft',
      email: data.unique_name,
      firstname: data.given_name,
      lastname: data.family_name,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
