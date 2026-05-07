import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/Pagination.dto';

export class WithdrawMoneyDto {
  @ApiProperty({ description: 'User account number' })
  @IsString()
  account_number: string;
  @ApiProperty({ description: 'Withdrawal amount' })
  @IsNumber()
  amount: number;
  @ApiProperty({ description: 'Bank code' })
  @IsString()
  bank_code: string;
}
export class GetTransactionDto extends PaginationDto {
  @ApiProperty({
    description: 'Transaction type',
    enum: ['Credit', 'Withdraw'],
  })
  @IsEnum(['Credit', 'Withdraw'])
  type: 'Credit' | 'Withdraw';
}

export class ScoreValueDto {
  @ApiProperty({ description: 'Score Value' })
  @IsNumber()
  scoreValue: number;
}
