import { Module } from '@nestjs/common';
import { CounterGateway } from './counter.gateway';
import { CounterService } from './counter.service';

@Module({
  providers: [CounterGateway, CounterService],
})
export class CounterModule {}
