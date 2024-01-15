import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { User } from '@/lib/decorators/user.decorator';
import { AuthService } from '../services/auth.service';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';
import { OAuthCallbackInterceptor } from '../interceptors/oauth-callback.interceptor';
import { OAuthCallback } from '../decorators/oauth-callback.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Google OAuth Controller')
@Controller('auth/google')
@UseInterceptors(OAuthCallbackInterceptor)
export class GoogleOAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {}

  @Get('callback')
  @UseGuards(GoogleOAuthGuard)
  @OAuthCallback()
  googleAuthRedirect(@User() user: OAuthCallbackDto) {
    return this.authService.oauthCallback(user);
  }
}
