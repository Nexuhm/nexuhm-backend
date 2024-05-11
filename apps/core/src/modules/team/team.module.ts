import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyModule } from '../company/company.module';
import { UsersModule } from '../users/users.module';
import { TeamController } from './controllers/team.controller';
import { InviteToken, InviteTokenSchema } from './schemas/invite-token.schema';
import { TeamService } from './services/team.service';
import { InvitesController } from './controllers/invites.controller';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: InviteToken.name,
        useFactory: () => InviteTokenSchema,
      },
    ]),
    EmailsModule,
    CompanyModule,
    UsersModule,
  ],
  controllers: [TeamController, InvitesController],
  exports: [MongooseModule],
  providers: [TeamService],
})
export class TeamModule {}
