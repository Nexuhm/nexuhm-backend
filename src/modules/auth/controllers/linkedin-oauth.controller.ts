import { Controller, Get, UseGuards } from '@nestjs/common';
import { LinkedInAuthGuard } from '../guards/linkedin-oauth.guard';
import { AuthService } from '../services/auth.service';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';
import { User } from '@/lib/decorators/user.decorator';

@Controller('auth/linkedin')
export class LinkedInOAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(LinkedInAuthGuard)
  async linkedInAuth() {}

  @Get('callback')
  @UseGuards(LinkedInAuthGuard)
  linkedInAuthRedirect(@User() user: OAuthCallbackDto) {
    return this.authService.oauthCallback(user);
  }
}
