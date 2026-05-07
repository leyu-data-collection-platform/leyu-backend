import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Wallet } from './entities/Wallet.entity';
import { ScoreValue } from './entities/ScoreValue.entity';
import { Transaction } from './entities/Transaction.entity';
import { WalletService } from './service/Wallet.service';
import { ScoreValueService } from './service/ScoreValue.service';
import { SantimpaySdk } from './service/SantimPay.service';
import { TransactionService } from './service/Transaction.service';
import { WalletController } from './controller/Wallet.controller';
import { TransactionController } from './controller/Transaction.controller';
import { ScoreValueController } from './controller/ScoreValue.controller';
import { ChapaPaymentService } from './service/ChapaPayment.service';
import { IdempotencyService } from './service/Idempotency.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Wallet, ScoreValue, Transaction]),
  ],
  controllers: [WalletController, TransactionController, ScoreValueController],
  providers: [
    WalletService,
    ScoreValueService,
    TransactionService,
    SantimpaySdk,
    ChapaPaymentService,
    IdempotencyService,
  ],
  exports: [WalletService, ScoreValueService, IdempotencyService],
})
export class FinanceModule {}
