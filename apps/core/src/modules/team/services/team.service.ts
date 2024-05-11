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
import { CompanyDocument } from '../../company/schemas/company.schema';
import { TeamInvitationEmailTemplate } from '../../emails/templates/team-invitation.template';
import { EmailService } from '../../emails/services/email.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(InviteToken.name)
    private readonly inviteTokenModel: Model<InviteToken>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly teamInviteTemplate: TeamInvitationEmailTemplate,
    private readonly emailService: EmailService,
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
    company: CompanyDocument,
    inviter: UserDocument,
  ) {
    const userExists = await this.userModel.exists({ email });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const invite = await this.inviteTokenModel.findOneAndUpdate(
      {
        email,
        company,
      },
      {
        email,
        role,
        company,
        inviter,
        token: randomUUID(),
      },
      {
        upsert: true,
        new: true,
      },
    );

    const { html } = await this.teamInviteTemplate.render({
      role,
      companyName: company.name,
      link: `${process.env.INVITATION_URL}/${invite?.token}`,
    });

    await this.emailService.sendEmail({
      recipients: {
        to: [
          {
            address: email,
          },
        ],
      },
      from: 'noreply@nexuhm.com',
      content: {
        subject: 'Invitation to join Nexuhm',
        html,
      },
    });
  }

  async removeMember(id: string, companyId: string, user: UserDocument) {
    const member = await this.userModel.findById(id);

    // don't remove if user isn't part of the company and owner
    const isMember = member?.company?.equals(user.company);
    const isOwner = user.roles.includes(UserRole.Owner);
    const isSameUser = member?.equals(user);

    if (!isMember || !isOwner || isSameUser) {
      throw new ForbiddenException();
    }

    await member?.deleteOne();
  }

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

  async verifyInviteToken(token: string) {
    return this.inviteTokenModel.findOne({ token });
  }
}
