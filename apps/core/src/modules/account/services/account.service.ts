import { User, UserDocument } from '@/core/modules/users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAccountDto } from '../dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async updateDetails(user: UserDocument, fields: UpdateAccountDto) {
    await user.updateOne(fields);
  }
}
