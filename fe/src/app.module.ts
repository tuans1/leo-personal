import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CounterModule } from './exercises/counter/counter.module';
import { ChatModule } from './exercises/chat/chat.module';
import { MultiRoomChatModule } from './exercises/multi-room-chat/multi-room-chat.module';

@Module({
  imports: [CounterModule, ChatModule, MultiRoomChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
