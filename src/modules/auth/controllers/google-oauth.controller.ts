import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { User } from '@/lib/decorators/user.decorator';
import { SignUpDto } from '../dto/signup.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth/google')
export class GoogleOAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {}

  @Get('callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@User() user: SignUpDto) {
    return this.authService.signUp(user, { signUpMethod: 'google' });
  }
}
