import { Module } from '@nestjs/common';
import { NOTIFICATION_SERVICE } from './notification.interface';
import { EmailNotificationService } from './email-notification.service';
import { SmsNotificationService } from './sms-notification.service';

@Module({
  providers: [
    EmailNotificationService,
    SmsNotificationService,
    {
      provide: NOTIFICATION_SERVICE,
      useClass: EmailNotificationService,
    },
  ],
  exports: [
    {
      provide: NOTIFICATION_SERVICE,
      useClass: EmailNotificationService,
    },
  ],
})
export class NotificationModule {
  // Để chuyển sang SMS, chỉ cần đổi useClass sang SmsNotificationService
  // mà không cần sửa bất kỳ logic nào trong UserService.
}


