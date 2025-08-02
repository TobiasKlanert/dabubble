export interface User {
  id: string;
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