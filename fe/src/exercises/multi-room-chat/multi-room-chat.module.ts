import { Module } from '@nestjs/common';
import { MultiRoomChatGateway } from './multi-room-chat.gateway';
import { MultiRoomChatService } from './multi-room-chat.service';

@Module({
  providers: [MultiRoomChatGateway, MultiRoomChatService],
})
export class MultiRoomChatModule {}
