import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './services/users.service';
import {
  UserIntegration,
  UserIntegrationSchema,
} from './schemas/user-integration.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => UserSchema,
      },
      {
        name: UserIntegration.name,
        useFactory: () => UserIntegrationSchema,
      },
    ]),
  ],
  exports: [UsersService],
  providers: [UsersService],
})
export class UsersModule {}
