export enum MultiRoomChatEvents {
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  SEND_MESSAGE = "send_message",
  NEW_MESSAGE = "new_message",
  USER_JOINED_ROOM = "user_joined_room",
  USER_LEFT_ROOM = "user_left_room",
  ROOM_USERS_UPDATE = "room_users_update",
  SWITCH_ROOM = "switch_room",
}

export const AVAILABLE_ROOMS = ["general", "tech", "random"] as const;
export type RoomName = (typeof AVAILABLE_ROOMS)[number];

export interface JoinRoomData {
  userName: string;
  roomName: RoomName;
}

export interface SendMessageData {
  message: string;
  roomName: RoomName;
}

export interface SwitchRoomData {
  newRoomName: RoomName;
}

export interface RoomMessage {
  id: string;
  roomName: RoomName;
  userName: string;
  message: string;
  timestamp: string | Date;
}

export interface SystemNotification {
  userName: string;
  roomName: RoomName;
  timestamp: string | Date;
  type: "join" | "leave";
}

export interface RoomUser {
  userName: string;
}

export interface RoomUsersUpdate {
  roomName: RoomName;
  users: RoomUser[];
}
