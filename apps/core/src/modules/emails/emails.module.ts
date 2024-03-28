import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ApplicationSuccessTemplate } from './templates/application-success.template';
import { PasswordResetEmailTemplate } from './templates/password-reset.template';
import { HireEmailTemplate } from './templates/job-hire.template';
import { JobOfferEmailTemplate } from './templates/job-offer.template';
import { InterviewInvitationEmailTemplate } from './templates/interview-invitation.template';

@Module({
  exports: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    HireEmailTemplate,
    JobOfferEmailTemplate,
    InterviewInvitationEmailTemplate,
  ],
  providers: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    HireEmailTemplate,
    JobOfferEmailTemplate,
    InterviewInvitationEmailTemplate,
  ],
})
export class EmailsModule {}
