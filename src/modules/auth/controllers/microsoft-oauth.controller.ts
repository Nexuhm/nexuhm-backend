import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MicrosoftAuthGuard } from '../guards/microsoft-oauth.guard';

@Controller('auth/microsoft')
export class MicrosodtOAuthController {
  @Get()
  @UseGuards(MicrosoftAuthGuard)
  microsoftLogin(): void {
    // initiates the Microsoft login process
  }

  @Get('callback')
  @UseGuards(MicrosoftAuthGuard)
  microsoftCallback(@Req() req: Express.Request): any {
    const user = req.user;

    return {
      success: true,
    };
  }
}
