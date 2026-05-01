import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S3Module } from './aws/s3';
import { CounterModule } from './exercises/counter/counter.module';
import { ChatModule } from './exercises/chat/chat.module';
import { MultiRoomChatModule } from './exercises/multi-room-chat/multi-room-chat.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from './typeorm/typeorm.module';
import { FileModule as FileMemoryModule } from './file/upload_memory';
import { FileModule as FileStreamModule } from './file/upload_stream';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // import { RedisModule } from './redis/redis.module' when enabling Redis
    // RedisModule,
    TypeOrmModule,
    FileMemoryModule,
    FileStreamModule,
    // S3Module,
    // ========================================
    CounterModule,
    ChatModule,
    MultiRoomChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
