import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { User } from '@/lib/decorators/user.decorator';
import { AuthService } from '../services/auth.service';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';

@Controller('auth/google')
export class GoogleOAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {}

  @Get('callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@User() user: OAuthCallbackDto) {
    return this.authService.oauthCallback(user);
  }
}
