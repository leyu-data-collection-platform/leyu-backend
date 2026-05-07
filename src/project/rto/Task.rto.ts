import { ApiProperty } from '@nestjs/swagger';
import { UserTaskStatus } from 'src/utils/constants/Task.constant';

export class TaskMembersListResponseDto {
  @ApiProperty()
  membership_id: string;
  @ApiProperty()
  id: string;
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phone_number: string;
  @ApiProperty()
  gender: string;
  @ApiProperty()
  is_active: boolean;
  @ApiProperty()
  score: number;
  @ApiProperty()
  status: UserTaskStatus;

  @ApiProperty()
  referral_code: string;

  @ApiProperty()
  role: string;
}
