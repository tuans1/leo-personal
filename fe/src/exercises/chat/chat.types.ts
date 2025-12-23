export enum ChatEvents {
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
}

export interface ChatUser {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

/**
 * DTO cho join room request
 * Phải là class (không phải interface) để tương thích với decorator metadata
 */
export class JoinRoomData {
  userName: string;
}

/**
 * DTO cho send message request
 * Phải là class (không phải interface) để tương thích với decorator metadata
 */
export class SendMessageData {
  message: string;
}

