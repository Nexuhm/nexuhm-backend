import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ApplicationSuccessTemplate } from './templates/application-success.template';
import { PasswordResetEmailTemplate } from './templates/password-reset.template';

@Module({
  exports: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
  ],
  providers: [
    EmailService,
    ApplicationSuccessTemplate,
    PasswordResetEmailTemplate,
  ],
})
export class EmailsModule {}
