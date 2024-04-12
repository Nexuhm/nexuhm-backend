import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.guard';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalLoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';
import { mixpanelProvider } from '../../analytics/mixpanel.provider';
import { Mixpanel } from 'mixpanel';
import { AnalyticsEvents } from '../../analytics/analytics-events.enum';

@ApiTags('Local Auth Controller')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(mixpanelProvider) private mixpanel: Mixpanel,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LocalLoginDto })
  @ApiOperation({ summary: 'Login into system via local strategy' })
  login(@Req() req) {
    this.mixpanel.track(AnalyticsEvents.Login, {
      distinct_id: req.user.id,
      strategy: 'local',
    });

    return this.authService.login(req.user);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  signup(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }
}
