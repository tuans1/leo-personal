import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_SERVICE } from '../notification/notification.interface';
import type { INotificationService } from '../notification/notification.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: INotificationService,
  ) {}

  async createUser(name: string): Promise<void> {
    // Demo: giả sử đã lưu user vào DB
    await this.notificationService.send(`Welcome, ${name}`);
  }
}
