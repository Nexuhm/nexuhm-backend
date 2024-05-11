import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ApplicationSuccessTemplate } from './templates/application-success.template';
import { PasswordResetEmailTemplate } from './templates/password-reset.template';
import { HireEmailTemplate } from './templates/job-hire.template';
import { JobOfferEmailTemplate } from './templates/job-offer.template';
import { InterviewInvitationEmailTemplate } from './templates/interview-invitation.template';
import { EmailController } from './controllers/email.controller';
import { MessageTemplate } from './templates/message.template';
import { TeamInvitationEmailTemplate } from './templates/team-invitation.template';

@Module({
  exports: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    HireEmailTemplate,
    JobOfferEmailTemplate,
    InterviewInvitationEmailTemplate,
    TeamInvitationEmailTemplate,
  ],
  providers: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    HireEmailTemplate,
    JobOfferEmailTemplate,
    InterviewInvitationEmailTemplate,
    TeamInvitationEmailTemplate,
    MessageTemplate,
  ],
  controllers: [EmailController],
})
export class EmailsModule {}
