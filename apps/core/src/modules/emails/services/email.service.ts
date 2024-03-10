import {
  EmailAttachment,
  EmailClient,
  EmailContent,
  EmailRecipients,
} from '@azure/communication-email';
import { Injectable } from '@nestjs/common';

interface SendEmailOptions {
  recipients: EmailRecipients;
  from: string;
  content: EmailContent;
  attachments?: EmailAttachment[];
}

@Injectable()
export class EmailService {
  client: EmailClient;
  constructor() {
    this.client = new EmailClient(
      process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING as string,
    );
  }

  async sendEmail({
    recipients,
    from,
    content,
    attachments,
  }: SendEmailOptions) {
    await this.client.beginSend({
      content,
      recipients,
      senderAddress: from,
      attachments,
    });
  }
}
