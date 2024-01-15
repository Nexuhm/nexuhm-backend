import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { LinkedInAuthGuard } from '../guards/linkedin-oauth.guard';
import { AuthService } from '../services/auth.service';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';
import { User } from '@/lib/decorators/user.decorator';
import { OAuthCallbackInterceptor } from '../interceptors/oauth-callback.interceptor';
import { OAuthCallback } from '../decorators/oauth-callback.decorator';

@UseInterceptors(OAuthCallbackInterceptor)
@Controller('auth/linkedin')
export class LinkedInOAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(LinkedInAuthGuard)
  async linkedInAuth() {}

  @Get('callback')
  @UseGuards(LinkedInAuthGuard)
  @OAuthCallback()
  linkedInAuthRedirect(@User() user: OAuthCallbackDto) {
    return this.authService.oauthCallback(user);
  }
}
