import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { ApplicationSuccessTemplate } from './templates/application-success.template';

@Module({
  exports: [EmailService, ApplicationSuccessTemplate],
  providers: [EmailService, ApplicationSuccessTemplate],
})
export class EmailsModule {}
