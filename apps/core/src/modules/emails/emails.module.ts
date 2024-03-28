import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ApplicationSuccessTemplate } from './templates/application-success.template';
import { PasswordResetEmailTemplate } from './templates/password-reset.template';
import { JobOfferEmailTemplate } from './templates/job-offer.template';
import { InterviewInvitationEmailTemplate } from './templates/interview-invitation.template';

@Module({
  exports: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    JobOfferEmailTemplate,
    InterviewInvitationEmailTemplate,
  ],
  providers: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    JobOfferEmailTemplate,
    InterviewInvitationEmailTemplate,
  ],
})
export class EmailsModule {}
