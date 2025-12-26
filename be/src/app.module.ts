import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CounterModule } from './exercises/counter/counter.module';
import { ChatModule } from './exercises/chat/chat.module';
import { MultiRoomChatModule } from './exercises/multi-room-chat/multi-room-chat.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CounterModule,
    ChatModule,
    MultiRoomChatModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
