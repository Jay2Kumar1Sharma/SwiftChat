export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  receiverId?: string;
  groupId?: string;
  timestamp: Date;
  messageType: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  isDelivered: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: User[];
  memberIds: string[];
  adminIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface Typing {
  userId: string;
  groupId: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'group_invite' | 'friend_request';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}
