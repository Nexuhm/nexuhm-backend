import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { TeamService } from '../services/team.service';
import { MemberInviteDto } from '../dto/member-invite.dto';

@Controller('/invites')
export class InvitesController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async inviteMember(
    @User() user: UserDocument,
    @Body() body: MemberInviteDto,
  ) {
    await user.populate('company');

    return this.teamService.inviteMember(
      body.email,
      body.role,
      user.company,
      user,
    );
  }

  @Post('/:invite/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeInvite(
    @User() user: UserDocument,
    @Param('invite') inviteId: string,
  ) {
    return this.teamService.revokeInvite(inviteId, user);
  }

  @Get('/:token/verify')
  async verifyInviteToken(@Param('token') token: string) {
    const invite = await this.teamService.verifyInviteToken(token);

    return {
      invite,
    };
  }
}
