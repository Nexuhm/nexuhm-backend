import { IsEmail, IsEnum, IsMongoId, IsString } from 'class-validator';
import { UserRole } from '../../users/types/user-role.enum';

export class MemberInviteDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsEnum(UserRole)
  @IsString()
  role: UserRole;

  @IsMongoId()
  @IsString()
  company: string;
}
