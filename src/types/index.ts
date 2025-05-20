export interface Topic {
  id: string;
  title: string;
  category: Category;
  subcategory: string;
  location: string;
  trending: boolean;
  imageUrl: string;
  contentCount: number;
  isOfficial: boolean;
}

export interface Content {
  id: string;
  topicId: string;
  type: 'video' | 'image' | 'text';
  title: string;
  description: string;
  mediaUrl?: string;
  likes: number;
  shares: number;
  userId: string;
  username: string;
  userAvatar: string;
  createdAt: string;
  isExternal?: boolean;
  externalSource?: string;
  tags: string[];
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  profile_completed: boolean;
  profile_setup_at: string | null;
  interests: string[];
  favoriteSubcategories: Array<{
    category: Category;
    subcategory: string;
  }>;
  savedContents: string[];
  contributedContents: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  contentId?: string;
  topicId?: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

export type Category = 'Sports' | 'Finance' | 'Health' | 'Culture' | 'Technology' | 'Education' | 'Entertainment' | 'Politics' | 'Science';

export interface CategoryWithSubcategories {
  category: Category;
  subcategories: string[];
  icon: string;
}

export interface FilterOptions {
  contentType?: 'video' | 'image' | 'text' | 'all';
  category?: Category | 'all';
  subcategory?: string | 'all';
  trending?: boolean;
  nearby?: boolean;
}