export enum ChatEvents {
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
}

export interface JoinRoomData {
  userName: string;
}

export interface SendMessageData {
  message: string;
}

export interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: string | Date;
}

export interface SystemNotification {
  userName: string;
  timestamp: string | Date;
  type: 'join' | 'leave';
}

