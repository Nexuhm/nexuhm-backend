import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './services/users.service';
import {
  UserIntegration,
  UserIntegrationSchema,
} from './schemas/user-integration.schema';
import { CompanyModule } from '../company/company.module';

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
    CompanyModule,
  ],
  exports: [UsersService, MongooseModule],
  providers: [UsersService],
})
export class UsersModule {}
