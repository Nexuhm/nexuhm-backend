import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ApplicationSuccessTemplate } from './templates/application-success.template';
import { PasswordResetEmailTemplate } from './templates/password-reset.template';
import { JobOfferEmailTemplate } from './templates/job-offer.template';

@Module({
  exports: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    JobOfferEmailTemplate,
  ],
  providers: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
    JobOfferEmailTemplate,
  ],
})
export class EmailsModule {}
