import { Model } from 'mongoose';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InviteToken } from '../schemas/invite-token.schema';
import { User, UserDocument } from '@/core/modules/users/schemas/user.schema';
import { UserRole } from '../../users/types/user-role.enum';

@Injectable()
export class InvitesService {
  constructor(
    @InjectModel(InviteToken.name)
    private readonly inviteTokenModel: Model<InviteToken>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async revokeInvite(id: string, user: UserDocument) {
    const invite = await this.inviteTokenModel.findById(id);

    // don't allow is user isn't owner and part of the company
    if (
      !invite?.company.equals(user.company) ||
      !user.roles.includes(UserRole.Owner)
    ) {
      throw new ForbiddenException();
    }

    await invite.deleteOne();
  }
}
