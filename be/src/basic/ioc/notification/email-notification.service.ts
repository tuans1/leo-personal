import { Injectable } from '@nestjs/common';
import { INotificationService } from './notification.interface';

@Injectable()
export class EmailNotificationService implements INotificationService {
  async send(message: string): Promise<void> {
    // Demo: log ra console thay vì gửi email thật
    console.log(`Sending EMAIL: ${message}`);
  }
}

