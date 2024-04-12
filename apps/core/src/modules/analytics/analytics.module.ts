import { Module } from '@nestjs/common';
import { mixpanelProvider, mixpanelProviderFactory } from './mixpanel.provider';

@Module({
  providers: [mixpanelProviderFactory],
  exports: [mixpanelProvider],
})
export class AnalytcisModule {}
