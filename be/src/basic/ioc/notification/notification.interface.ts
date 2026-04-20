export interface INotificationService {
  send(message: string): Promise<void>;
}

export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';

