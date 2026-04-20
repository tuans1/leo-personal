import { Injectable } from '@nestjs/common';
import { INotificationService } from './notification.interface';

@Injectable()
export class SmsNotificationService implements INotificationService {
  async send(message: string): Promise<void> {
    // Demo: log ra console thay vì gửi SMS thật
    console.log(`Sending SMS: ${message}`);
  }
}

