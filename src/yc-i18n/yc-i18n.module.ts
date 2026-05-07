import { Module } from '@nestjs/common';
import { YcI18nService } from './yc-i18n.service';

@Module({
  providers: [YcI18nService],
  exports: [YcI18nService],
})
export class YcI18nModule {}
