import { Topic, Content, User, Conversation, Message, Category, CategoryWithSubcategories } from '../types';

export const CATEGORIES: CategoryWithSubcategories[] = [
  {
    category: 'Sports',
    icon: '⚽',
    subcategories: ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Swimming', 'Athletics', 'Boxing', 'MMA', 'Cricket', 'Rugby']
  },
  {
    category: 'Finance',
    icon: '💰',
    subcategories: ['Stock Market', 'Cryptocurrency', 'Real Estate', 'Personal Finance', 'Banking', 'Investment', 'Insurance', 'Taxes']
  },
  {
    category: 'Health',
    icon: '🏥',
    subcategories: ['Fitness', 'Nutrition', 'Mental Health', 'Yoga', 'Alternative Medicine', 'Medical Research', 'Public Health']
  },
  {
    category: 'Culture',
    icon: '🎭',
    subcategories: ['Art', 'Music', 'Literature', 'Theater', 'Dance', 'Fashion', 'Food', 'Traditions']
  },
  {
    category: 'Technology',
    icon: '💻',
    subcategories: ['Software Development', 'Artificial Intelligence', 'Cybersecurity', 'Blockchain', 'Mobile Tech', 'Gaming', 'Hardware', 'Cloud Computing']
  },
  {
    category: 'Education',
    icon: '📚',
    subcategories: ['Online Learning', 'Language Learning', 'STEM', 'Professional Development', 'Early Education', 'Higher Education', 'Special Education']
  },
  {
    category: 'Entertainment',
    icon: '🎬',
    subcategories: ['Movies', 'TV Shows', 'Video Games', 'Streaming', 'Podcasts', 'Celebrities', 'Live Events']
  },
  {
    category: 'Politics',
    icon: '🏛️',
    subcategories: ['Local Politics', 'National Politics', 'International Relations', 'Policy', 'Elections', 'Activism', 'Legislation']
  },
  {
    category: 'Science',
    icon: '🔬',
    subcategories: ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Environmental Science', 'Neuroscience', 'Computer Science']
  }
];

export const mockTopics: Topic[] = [
  {
    id: '1',
    title: 'UEFA Champions League Final',
    category: 'Sports',
    subcategory: 'Football',
    location: 'Istanbul',
    trending: true,
    imageUrl: 'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg',
    contentCount: 145,
    isOfficial: true
  },
  {
    id: '2',
    title: 'Rising Inflation Rates',
    category: 'Finance',
    subcategory: 'Stock Market',
    location: 'Ankara',
    trending: true,
    imageUrl: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg',
    contentCount: 89,
    isOfficial: true
  },
  {
    id: '3',
    title: 'New Covid Variant',
    category: 'Health',
    subcategory: 'Public Health',
    location: 'Istanbul',
    trending: false,
    imageUrl: 'https://images.pexels.com/photos/3992933/pexels-photo-3992933.jpeg',
    contentCount: 67,
    isOfficial: true
  },
  {
    id: '4',
    title: 'Istanbul Film Festival',
    category: 'Culture',
    subcategory: 'Art',
    location: 'Istanbul',
    trending: true,
    imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
    contentCount: 112,
    isOfficial: false
  },
  {
    id: '5',
    title: 'New AI Developments',
    category: 'Technology',
    subcategory: 'Artificial Intelligence',
    location: 'Izmir',
    trending: true,
    imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    contentCount: 78,
    isOfficial: false
  },
  {
    id: '6',
    title: 'Education Reform',
    category: 'Education',
    subcategory: 'Higher Education',
    location: 'Ankara',
    trending: false,
    imageUrl: 'https://images.pexels.com/photos/2781814/pexels-photo-2781814.jpeg',
    contentCount: 45,
    isOfficial: false
  }
];

export const mockContents: Content[] = [
  {
    id: '1',
    topicId: '1',
    type: 'video',
    title: 'Goal Highlights from Last Night',
    description: 'Amazing goals from the Champions League match yesterday',
    mediaUrl: 'https://images.pexels.com/photos/3571065/pexels-photo-3571065.jpeg',
    likes: 342,
    shares: 56,
    userId: '1',
    username: 'sportsmaniac',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    createdAt: '2023-05-24T18:30:00Z',
    tags: ['football', 'champions', 'goals']
  },
  {
    id: '2',
    topicId: '1',
    type: 'image',
    title: 'Stadium Atmosphere',
    description: 'The incredible atmosphere at the stadium last night',
    mediaUrl: 'https://images.pexels.com/photos/2144326/pexels-photo-2144326.jpeg',
    likes: 187,
    shares: 23,
    userId: '2',
    username: 'photomaster',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    createdAt: '2023-05-24T20:15:00Z',
    tags: ['atmosphere', 'fans', 'stadium']
  },
  {
    id: '3',
    topicId: '2',
    type: 'text',
    title: 'Analysis of Current Inflation',
    description: 'A detailed breakdown of the factors contributing to current inflation rates and what to expect in the coming months.',
    likes: 76,
    shares: 12,
    userId: '3',
    username: 'econexpert',
    userAvatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    createdAt: '2023-05-23T09:45:00Z',
    isExternal: true,
    externalSource: 'Financial Times',
    tags: ['economy', 'inflation', 'analysis']
  },
  {
    id: '4',
    topicId: '4',
    type: 'image',
    title: 'Opening Night',
    description: 'Celebrities at the opening night of Istanbul Film Festival',
    mediaUrl: 'https://images.pexels.com/photos/2041396/pexels-photo-2041396.jpeg',
    likes: 231,
    shares: 41,
    userId: '4',
    username: 'filmcritic',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    createdAt: '2023-05-22T22:10:00Z',
    tags: ['festival', 'celebrities', 'film']
  },
  {
    id: '5',
    topicId: '5',
    type: 'video',
    title: 'AI Demo: Image Generation',
    description: 'Watch how the new AI model generates photorealistic images in seconds',
    mediaUrl: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg',
    likes: 453,
    shares: 87,
    userId: '5',
    username: 'techguru',
    userAvatar: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
    createdAt: '2023-05-21T14:20:00Z',
    isExternal: true,
    externalSource: 'Tech Insider',
    tags: ['ai', 'technology', 'innovation']
  }
];

export const mockUser: User = {
  id: '10',
  username: 'aliuzun',
  avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
  bio: 'Tech enthusiast and sports lover. Always curious about what\'s happening around me.',
  interests: ['Technology', 'Sports', 'Culture', 'Finance'],
  favoriteSubcategories: [
    { category: 'Sports', subcategory: 'Football' },
    { category: 'Technology', subcategory: 'Artificial Intelligence' },
    { category: 'Finance', subcategory: 'Cryptocurrency' }
  ],
  savedContents: ['1', '5'],
  contributedContents: ['3']
};

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: ['10', '2'],
    lastMessage: {
      id: '101',
      senderId: '2',
      senderName: 'photomaster',
      senderAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      receiverId: '10',
      contentId: '2',
      topicId: '1',
      text: 'Check out this amazing photo from the match!',
      timestamp: '2023-05-24T21:05:00Z',
      read: false
    },
    unreadCount: 1
  },
  {
    id: '2',
    participants: ['10', '5'],
    lastMessage: {
      id: '102',
      senderId: '10',
      senderName: 'aliuzun',
      senderAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      receiverId: '5',
      contentId: '5',
      topicId: '5',
      text: 'This AI demo is incredible! How does it work?',
      timestamp: '2023-05-23T16:45:00Z',
      read: true
    },
    unreadCount: 0
  }
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '101',
      senderId: '2',
      senderName: 'photomaster',
      senderAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      receiverId: '10',
      contentId: '2',
      topicId: '1',
      text: 'Check out this amazing photo from the match!',
      timestamp: '2023-05-24T21:05:00Z',
      read: false
    },
    {
      id: '100',
      senderId: '10',
      senderName: 'aliuzun',
      senderAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      receiverId: '2',
      contentId: '2',
      topicId: '1',
      text: 'Great shot! Were you at the stadium?',
      timestamp: '2023-05-24T20:30:00Z',
      read: true
    }
  ],
  '2': [
    {
      id: '102',
      senderId: '10',
      senderName: 'aliuzun',
      senderAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      receiverId: '5',
      contentId: '5',
      topicId: '5',
      text: 'This AI demo is incredible! How does it work?',
      timestamp: '2023-05-23T16:45:00Z',
      read: true
    },
    {
      id: '103',
      senderId: '5',
      senderName: 'techguru',
      senderAvatar: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
      receiverId: '10',
      contentId: '5',
      topicId: '5',
      text: 'It uses a combination of GAN and transformer architecture. I can explain more if you\'re interested!',
      timestamp: '2023-05-23T17:00:00Z',
      read: true
    }
  ]
};