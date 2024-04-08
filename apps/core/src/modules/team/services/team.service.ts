import { Model } from 'mongoose';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@/core/modules/users/types/user-role.enum';
import { InjectModel } from '@nestjs/mongoose';
import { InviteToken } from '../schemas/invite-token.schema';
import { User, UserDocument } from '@/core/modules/users/schemas/user.schema';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(InviteToken.name)
    private readonly inviteTokenModel: Model<InviteToken>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getMembers(company: string) {
    return this.userModel.find({ company });
  }

  async getInvites(company: string) {
    return this.inviteTokenModel.find({ company });
  }

  async inviteMember(
    email: string,
    role: UserRole,
    company: string,
    inviter: UserDocument,
  ) {
    const inviteExists = await this.inviteTokenModel.exists({
      email,
      company,
    });

    if (inviteExists) {
      throw new BadRequestException('Invite already exists');
    }

    const userExists = await this.userModel.exists({ email });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    await this.inviteTokenModel.create({
      email,
      role,
      company,
      inviter,
    });
  }

  async removeMember(id: string, companyId: string, user: UserDocument) {
    const member = await this.userModel.findById(id);

    // don't remove if user isn't part of the company and owner
    const isMember = member?.company?.equals(user.company);
    const isOwner = user.roles.includes(UserRole.Owner);
    const isSameUser = member?.equals(user);

    if (!isMember || !isOwner || !isSameUser) {
      throw new ForbiddenException();
    }

    await member?.deleteOne();
  }
}
