import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreatePasswordResetTokenDto,
  PasswordResetDto,
} from '../dto/password-reset.dto';
import { PasswordResetService } from '../services/password-reset.service';

@ApiTags('Password Reset Controller')
@Controller('/auth/password')
export class PasswordResetController {
  constructor(private passwordResetService: PasswordResetService) {}

  @Post('/reset/create')
  async createResetToken(@Body() body: CreatePasswordResetTokenDto) {
    await this.passwordResetService.createResetToken(body.email);

    return {
      success: true,
    };
  }

  @Post('/reset/validate')
  async validateResetToken(@Body('token') token: string) {
    const resetToken =
      await this.passwordResetService.validateAndGetResetToken(token);

    return {
      isValid: !!resetToken,
    };
  }

  @Post('/reset')
  async resetToken(@Body() body: PasswordResetDto) {
    await this.passwordResetService.resetPasword(
      body.token,
      body.newPassword,
      body.confirmPassword,
    );

    return {
      success: true,
    };
  }
}
