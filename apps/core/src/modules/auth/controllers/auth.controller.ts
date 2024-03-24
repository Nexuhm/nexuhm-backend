import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.guard';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalLoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';

@ApiTags('Local Auth Controller')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LocalLoginDto })
  @ApiOperation({ summary: 'Login into system via local strategy' })
  login(@Req() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  signup(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }
}
