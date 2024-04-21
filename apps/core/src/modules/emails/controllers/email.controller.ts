import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { MessageTemplate } from '../templates/message.template';

@Controller()
export class EmailController {
  constructor(
    private emailsService: EmailService,
    private messageTemplate: MessageTemplate,
  ) {}

  @Post('/send/message')
  async sendMessage(@Body() body: SendMessageDto) {
    const res = await this.messageTemplate.render(body);

    await this.emailsService.sendEmail({
      recipients: {
        to: process.env.ADMIN_EMAILS?.split(',').map((address) => ({
          address,
        })),
      },
      from: 'noreply@nexuhm.com',
      content: {
        subject: body.subject,
        html: res.html,
      },
    });
  }
}
