import { Controller, Get, UseGuards } from '@nestjs/common';
import { MicrosoftAuthGuard } from '../guards/microsoft-oauth.guard';
import { AuthService } from '../services/auth.service';
import { OAuthCallbackDto } from '../dto/oauth-callback.dto';
import { User } from '@/lib/decorators/user.decorator';

@Controller('auth/microsoft')
export class MicrosoftOAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuth() {}

  @Get('callback')
  @UseGuards(MicrosoftAuthGuard)
  microsoftAuthRedirect(@User() user: OAuthCallbackDto) {
    return this.authService.oauthCallback(user);
  }
}
