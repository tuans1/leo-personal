import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

