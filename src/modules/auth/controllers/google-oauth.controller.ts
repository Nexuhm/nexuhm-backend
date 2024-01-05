import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';

@Controller('auth/google')
export class GoogleOAuthController {
  constructor() {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect() {
    return {
      success: true,
    };
  }
}
