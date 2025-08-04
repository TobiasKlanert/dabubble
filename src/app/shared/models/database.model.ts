export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string;
  joinedAt: string;
  onlineStatus: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  profilePictureUrl: string;
  joinedAt: string;
  onlineStatus: boolean;
}

export interface DirectChat {
  id: string;
  participants: string[];
  createdAt: string;
}

export interface UserChatPreview {
  chatId: string;
  chatCreatedAt: string;
  partner: {
    id: string;
    name: string;
    profilePictureUrl: string;
    onlineStatus: boolean;
  };
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  creatorId: string;
  members: string[];
  messages: ChannelMessage[] | null;
}

export interface CreateChannelData {
  name: string;
  description: string;
  creatorId: string;
  members: string[];
}

export interface ChannelMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt?: string | null;
  repliesCount: number;
  reactions: Reaction;
  thread: ThreadMessage[];
}

export interface Reaction {
  [emoji: string]: {
    count: number;
    userIds: string[];
  };
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt?: string | null;
}
