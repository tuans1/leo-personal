export enum MultiRoomChatEvents {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  SEND_MESSAGE = 'send_message',
  NEW_MESSAGE = 'new_message',
  USER_JOINED_ROOM = 'user_joined_room',
  USER_LEFT_ROOM = 'user_left_room',
  ROOM_USERS_UPDATE = 'room_users_update',
  SWITCH_ROOM = 'switch_room',
}

export const AVAILABLE_ROOMS = ['general', 'tech', 'random'] as const;
export type RoomName = (typeof AVAILABLE_ROOMS)[number];

export interface RoomUser {
  socketId: string;
  userName: string;
  currentRoom: RoomName;
}

export interface RoomMessage {
  id: string;
  roomName: RoomName;
  userName: string;
  message: string;
  timestamp: Date;
}

/**
 * DTO cho join room request
 */
export class JoinRoomData {
  userName: string;
  roomName: RoomName;
}

/**
 * DTO cho send message request
 */
export class SendMessageData {
  message: string;
  roomName: RoomName;
}

/**
 * DTO cho switch room request
 */
export class SwitchRoomData {
  newRoomName: RoomName;
}
