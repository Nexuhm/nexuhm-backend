import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    super({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/linkedin/callback`,
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  async validate(
    accessToken: string,
    _: unknown,
    profile: any,
    done: Function,
  ) {
    try {
      const user: OAuthCallbackDto = {
        type: 'linkedin',
        email: profile.emails[0].value,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        accessToken,
      };

      done(null, user);
    } catch (err) {
      // Handle error
      done(err, false);
    }
  }
}
