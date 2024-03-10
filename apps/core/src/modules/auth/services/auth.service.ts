import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/core/modules/users/services/users.service';
import { SignUpDto } from '../dto/signup.dto';
import { compareBcryptHashes, createBcryptHash } from '@/core/lib/utils/crypto';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';
import { CompanyService } from '@/core/modules/company/services/company.service';
import { toPossessive } from '@/core/lib/utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(fields: SignUpDto) {
    const existingUser = await this.usersService.findByEmail(fields.email);

    if (existingUser) {
      throw new BadRequestException({
        fields: {
          email: 'User with following email exists',
        },
      });
    }

    const passwordHash = fields.password
      ? await createBcryptHash(fields.password)
      : undefined;

    const user = await this.usersService.create({
      ...fields,
      password: passwordHash,
      metaData: {
        signUpMethod: 'website',
      },
    });

    const result = await this.login(user);

    return result;
  }

  /**
   * Perform OAuth sign-up for a user.
   * If the user already exists, log them in and update integration details;
   * otherwise, create a new user account.
   *
   * @param fields - The data needed for OAuth sign-up.
   * @returns A result containing user information and authentication tokens.
   */
  async oauthCallback(fields: OAuthCallbackDto) {
    // Check if the user with the provided email already exists.
    let user = await this.usersService.findByEmail(fields.email);

    // If the user doesn't exist, create a new user account.
    if (!user) {
      user = await this.usersService.create({
        email: fields.email,
        firstname: fields.firstname,
        lastname: fields.lastname,
        picture: fields.picture,
        metaData: {
          signUpMethod: fields.type, // Store the sign-up method in user metadata.
        },
      });
    }

    // If the user exists or was just created, update their integration details.
    await this.usersService.createIntegration(user, {
      accessToken: fields.accessToken,
      refreshToken: fields.refreshToken,
      type: fields.type,
    });

    // Log in the user and generate authentication tokens.
    const result = await this.login(user);

    // Return the result containing user information and tokens.
    return result;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email, {
      password: true,
    });

    const isValid = compareBcryptHashes(user?.password || '', password);

    if (!isValid) {
      return null;
    }

    return user;
  }

  async login(user: UserDocument) {
    return {
      token: this.jwtService.sign({
        sub: user._id,
        email: user.email,
      }),
    };
  }
}
