import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { InvitesService } from '../services/invites.service';

@Controller('/invites')
@UseGuards(JwtAuthGuard)
export class InvitesController {
  constructor(private readonly inviteService: InvitesService) {}

  @Post('/:invite/revoke')
  async revokeInvite(
    @User() user: UserDocument,
    @Param('invite') inviteId: string,
  ) {
    return this.inviteService.revokeInvite(inviteId, user);
  }
}
