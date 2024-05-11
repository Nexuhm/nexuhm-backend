import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from '../services/team.service';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '@/core/modules/users/schemas/user.schema';
import { UserRole } from '@/core/modules/users/types/user-role.enum';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';

@Controller('/team/:company')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  async getMembers(
    @User() user: UserDocument,
    @Param('company') company: string,
  ) {
    // don't send if user isn't part of the company and owner
    if (
      user.company.toString() !== company ||
      !user.roles.includes(UserRole.Owner)
    ) {
      throw new ForbiddenException("You can't send invite for this company");
    }

    const members = await this.teamService.getMembers(company).then((items) =>
      items.map((item) => ({
        id: item.id,
        name: `${item.firstname} ${item.lastname}`,
        email: item.email,
        roles: item.roles,
        picture: item.picture,
        createdAt: item.createdAt,
      })),
    );

    const invites = await this.teamService.getInvites(company).then((items) =>
      items.map((item) => ({
        id: item.id,
        email: item.email,
        role: item.role,
        createdAt: item.createdAt,
      })),
    );

    return {
      members,
      invites,
    };
  }

  @Post('/members/:member/remove')
  async removeMembers(
    @User() user: UserDocument,
    @Param('company') companyId: string,
    @Param('member') memberId: string,
  ) {
    await this.teamService.removeMember(memberId, companyId, user);
  }
}
