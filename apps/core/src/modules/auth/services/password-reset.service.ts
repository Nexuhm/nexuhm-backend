import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { addMinutes, isBefore } from 'date-fns';
import { UsersService } from '@/core/modules/users/services/users.service';
import { PasswordResetToken } from '../schemas/password-reset-token.schema';
import { EmailService } from '@/core/modules/emails/services/email.service';
import { PasswordResetEmailTemplate } from '../../emails/templates/password-reset.template';
import { UserDocument } from '../../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { createBcryptHash } from '@/core/lib/utils/crypto';

@Injectable()
export class PasswordResetService {
  constructor(
    private usersService: UsersService,
    private emailServive: EmailService,
    private passwordResetTemplate: PasswordResetEmailTemplate,
    @InjectModel(PasswordResetToken.name)
    private passwordResetTokenModel: Model<PasswordResetToken>,
  ) {}

  async createResetToken(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const resetToken = await this.passwordResetTokenModel.create({
      email,
    });

    await this.sendResetEmail(user, resetToken.token);
  }

  async validateAndGetResetToken(token: string) {
    const resetToken = await this.passwordResetTokenModel.findOne({ token });

    if (!resetToken) {
      return false;
    }

    // token expires in 15 minutes
    const threshold = addMinutes(resetToken.createdAt, 15);

    if (isBefore(threshold, resetToken.createdAt)) {
      return false;
    }

    return resetToken;
  }

  async resetPasword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const resetToken = await this.validateAndGetResetToken(token);

    if (!resetToken) {
      throw new BadRequestException('Token is expired or invalid.');
    }

    const user = await this.usersService.findByEmail(resetToken.email);

    if (!user) {
      throw new BadRequestException('Error during execution.');
    }

    if (newPassword === confirmPassword) {
      await user.updateOne({
        password: await createBcryptHash(newPassword),
      });
    }

    await resetToken.deleteOne();
  }

  async sendResetEmail(user: UserDocument, token: string) {
    const result = await this.passwordResetTemplate.render({
      firstname: user.firstname,
      token,
    });

    await this.emailServive.sendEmail({
      from: 'noreply@nexuhm.com',
      content: {
        subject: 'Password Reset Token',
        html: result.html,
      },
      recipients: {
        to: [
          {
            address: user.email,
            displayName: `${user.firstname} ${user.lastname}`,
          },
        ],
      },
    });
  }
}
