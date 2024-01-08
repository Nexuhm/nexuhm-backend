import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/services/users.service';
import { SignUpDto } from '../dto/signup.dto';
import { compareBcryptHashes, createBcryptHash } from '@/lib/utils/crypto';
import {
  UserDocument,
  UserMetaData,
} from '@/modules/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(fields: SignUpDto, metaData?: UserMetaData) {
    const existingUser = await this.usersService.findByEmail(fields.email);

    if (existingUser) {
      throw new BadRequestException({
        fields: {
          email: 'User with following email exists',
        },
      });
    }

    const passwordHash = await createBcryptHash(fields.password);

    const user = await this.usersService.create({
      ...fields,
      password: passwordHash,
      metaData: {
        signUpMethod: metaData?.signUpMethod || 'website',
      },
    });

    const token = await this.login(user);

    return {
      token,
    };
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
