import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { MicrosoftAuthGuard } from '../guards/microsoft-oauth.guard';
import { AuthService } from '../services/auth.service';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';
import { User } from '@/core/lib/decorators/user.decorator';
import { OAuthCallbackInterceptor } from '../interceptors/oauth-callback.interceptor';
import { OAuthCallback } from '../decorators/oauth-callback.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Microsoft OAuth Controller')
@UseInterceptors(OAuthCallbackInterceptor)
@Controller('auth/microsoft')
export class MicrosoftOAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuth() {}

  @Get('callback')
  @UseGuards(MicrosoftAuthGuard)
  @OAuthCallback()
  microsoftAuthRedirect(@User() user: OAuthCallbackDto) {
    return this.authService.oauthCallback(user);
  }
}
