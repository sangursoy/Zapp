import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Topic, Content, User, FilterOptions, Conversation, Message, Category } from '../types';
import { mockTopics, mockContents, mockUser, mockConversations, mockMessages, CATEGORIES } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '../hooks/useToast';

interface AppContextType {
  user: SupabaseUser | null;
  loading: boolean;
  userProfile: User | null;
  topics: Topic[];
  contents: Content[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  filterOptions: FilterOptions;
  currentTopic: Topic | null;
  categories: typeof CATEGORIES;
  setFilterOptions: (options: FilterOptions) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  saveContent: (contentId: string) => void;
  likeContent: (contentId: string) => void;
  shareContent: (contentId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageAsRead: (messageId: string, conversationId: string) => void;
  toggleFavoriteSubcategory: (category: Category, subcategory: string) => void;
  refreshNews: () => Promise<void>;
  generateAIContent: () => Promise<void>;
  setUserProfile: (profile: User | null) => void;
  refreshUserProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [topicsState] = useState<Topic[]>(mockTopics);
  const [contentsState] = useState<Content[]>(mockContents);
  const [conversationsState] = useState<Conversation[]>(mockConversations);
  const [messagesState] = useState<Record<string, Message[]>>(mockMessages);
  const [filterOptionsState, setFilterOptionsState] = useState<FilterOptions>({
    contentType: 'all',
    category: 'all',
    subcategory: 'all',
    trending: false,
    nearby: false
  });
  const [currentTopicState, setCurrentTopicState] = useState<Topic | null>(null);
  const toast = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setUserProfile(null);
          return null;
        }
        throw error;
      }

      if (profile) {
        const userProfile = {
          id: userId,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          profile_completed: profile.profile_completed,
          profile_setup_at: profile.profile_setup_at,
          interests: [],
          favoriteSubcategories: [],
          savedContents: [],
          contributedContents: []
        };
        
        setUserProfile(userProfile);
        return userProfile;
      }

      setUserProfile(null);
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      setUserProfile(null);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    return fetchUserProfile(user.id);
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else if (mounted) {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Failed to initialize auth');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        setLoading(true);

        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast.error('Authentication error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshNews = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase configuration');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/news-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to refresh news';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage = `${errorMessage}: ${errorText || response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const { data: newTopics, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (topicsError) throw topicsError;
      if (newTopics) setTopicsState(newTopics);

      return data;
    } catch (error) {
      console.error('Failed to refresh news:', error);
      toast.error('Failed to refresh news');
      throw error;
    }
  };

  const generateAIContent = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase configuration');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-content-generator`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errorMessage = 'Edge function failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage = `${errorMessage}: ${errorText || response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const { success, data, error } = await response.json();

      if (!success || error) {
        throw new Error(error || 'Failed to generate content');
      }

      let retries = 3;
      while (retries > 0) {
        try {
          const { data: newTopics, error: topicsError } = await supabase
            .from('topics')
            .select('*')
            .order('created_at', { ascending: false });

          if (topicsError) throw topicsError;

          const { data: newContents, error: contentsError } = await supabase
            .from('contents')
            .select('*')
            .order('created_at', { ascending: false });

          if (contentsError) throw contentsError;

          if (newTopics) setTopicsState(newTopics);
          if (newContents) setContentsState(newContents);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return data;
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      
      if (error.name === 'AbortError') {
        toast.error('AI content generation timed out');
        throw new Error('AI content generation timed out after 120 seconds');
      }
      
      toast.error('Failed to generate AI content');
      throw error;
    }
  };

  const toggleFavoriteSubcategory = (category: Category, subcategory: string) => {
    if (!userProfile) return;
    
    setUserProfile(prev => {
      if (!prev) return prev;
      
      const isFavorite = prev.favoriteSubcategories.some(
        fav => fav.category === category && fav.subcategory === subcategory
      );

      if (isFavorite) {
        return {
          ...prev,
          favoriteSubcategories: prev.favoriteSubcategories.filter(
            fav => !(fav.category === category && fav.subcategory === subcategory)
          )
        };
      } else {
        return {
          ...prev,
          favoriteSubcategories: [...prev.favoriteSubcategories, { category, subcategory }]
        };
      }
    });
  };

  const saveContent = (contentId: string) => {
    if (!userProfile) return;
    
    setUserProfile(prev => {
      if (!prev) return prev;
      
      if (prev.savedContents.includes(contentId)) {
        return {
          ...prev,
          savedContents: prev.savedContents.filter(id => id !== contentId)
        };
      } else {
        return {
          ...prev,
          savedContents: [...prev.savedContents, contentId]
        };
      }
    });
  };

  const likeContent = (contentId: string) => {
    setContentsState(prev => 
      prev.map(content => 
        content.id === contentId 
          ? { ...content, likes: content.likes + 1 } 
          : content
      )
    );
  };

  const shareContent = (contentId: string) => {
    setContentsState(prev => 
      prev.map(content => 
        content.id === contentId 
          ? { ...content, shares: content.shares + 1 } 
          : content
      )
    );
  };

  const sendMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };

    const existingConversation = conversationsState.find(c => 
      c.participants.includes(messageData.senderId) && c.participants.includes(messageData.receiverId)
    );

    if (existingConversation) {
      setConversationsState(prev => 
        prev.map(conv => 
          conv.id === existingConversation.id 
            ? {
                ...conv,
                lastMessage: newMessage,
                unreadCount: conv.unreadCount + (messageData.senderId !== userProfile?.id ? 1 : 0)
              } 
            : conv
        )
      );

      setMessagesState(prev => ({
        ...prev,
        [existingConversation.id]: [...(prev[existingConversation.id] || []), newMessage]
      }));
    } else {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        participants: [messageData.senderId, messageData.receiverId],
        lastMessage: newMessage,
        unreadCount: messageData.senderId !== userProfile?.id ? 1 : 0
      };

      setConversationsState(prev => [...prev, newConversation]);
      
      setMessagesState(prev => ({
        ...prev,
        [newConversation.id]: [newMessage]
      }));
    }
  };

  const markMessageAsRead = (messageId: string, conversationId: string) => {
    setMessagesState(prev => ({
      ...prev,
      [conversationId]: prev[conversationId].map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    }));

    setConversationsState(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) } 
          : conv
      )
    );
  };

  const value = {
    user,
    loading,
    userProfile,
    topics: topicsState,
    contents: contentsState,
    conversations: conversationsState,
    messages: messagesState,
    filterOptions: filterOptionsState,
    currentTopic: currentTopicState,
    categories: CATEGORIES,
    setFilterOptions: setFilterOptionsState,
    setCurrentTopic: setCurrentTopicState,
    saveContent,
    likeContent,
    shareContent,
    sendMessage,
    markMessageAsRead,
    toggleFavoriteSubcategory,
    refreshNews,
    generateAIContent,
    setUserProfile,
    refreshUserProfile
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export { AppProvider, useAppContext };