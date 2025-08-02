export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string;
  joinedAt: string;
  onlineStatus: boolean;
  channels: string[];
  chats: {
    [chatId: string]: UserChat;
  };
}

export interface UserChat {
  with: string[];
  createdAt: string;
  messages: {
    [messageId: string]: UserChatMessage;
  };
}

export interface UserChatMessage {
  senderId: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  reactions?: {
    [emoji: string]: string[];
  };
}
