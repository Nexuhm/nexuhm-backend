import { Controller, Get, UseGuards } from '@nestjs/common';
import { LinkedInAuthGuard } from '../guards/linkedin-oauth.guard';

@Controller('auth/linkedin')
export class LinkedInOAuthController {
  constructor() {}

  @Get()
  @UseGuards(LinkedInAuthGuard)
  async googleAuth() {}

  @Get('callback')
  @UseGuards(LinkedInAuthGuard)
  googleAuthRedirect() {
    return {
      success: true,
    };
  }
}
