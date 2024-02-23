import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountService } from '../services/account.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { User } from '@/lib/decorators/user.decorator';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { UserDocument } from '@/modules/users/schemas/user.schema';

@Controller('/account')
@ApiTags('Account Controller')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/update')
  @UseGuards(JwtAuthGuard)
  updateDetails(@User() user: UserDocument, @Body() body: UpdateAccountDto) {
    return this.accountService.updateDetails(user, body);
  }

  @Get('/details')
  @UseGuards(JwtAuthGuard)
  getDetails(@User() user: UserDocument) {
    return {
      email: user.email,
      picture: user.picture,
      firstname: user.firstname,
      lastname: user.lastname,
      company: user.company,
    };
  }
}
