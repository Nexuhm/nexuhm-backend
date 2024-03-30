import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';

@Controller('/users/onboarding')
export class OnboardingController {
  @Post('/stage')
  @UseGuards(JwtAuthGuard)
  async setOnboardingStage(
    @User() user: UserDocument,
    @Body('stage') onboardingStage: number,
  ) {
    await user.updateOne({
      onboardingStage,
    });
  }

  @Get('/stage')
  @UseGuards(JwtAuthGuard)
  async getOnboardingStage(@User() user: UserDocument) {
    return {
      roles: user.roles,
      onboardingStage: user.onboardingStage,
    };
  }
}
