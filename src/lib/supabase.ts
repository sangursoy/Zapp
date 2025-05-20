import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables:\n' + 
    (!supabaseUrl ? '- VITE_SUPABASE_URL\n' : '') +
    (!supabaseAnonKey ? '- VITE_SUPABASE_ANON_KEY\n' : '')
  );
}

// Create the Supabase client with explicit storage configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'sb-auth-token',
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'zapp'
    }
  },
  storage: {
    retryAttempts: 3,
    retryInterval: 500
  }
});

export const handleAuthError = async (error: any) => {
  console.error('Auth error:', error);
  
  const isAuthError = error.message?.includes('Invalid Refresh Token') ||
    error.message?.includes('Refresh Token Not Found') ||
    error.message?.includes('JWT') ||
    error.message?.includes('token');

  if (isAuthError) {
    // Clear all Supabase-related items from localStorage
    ['sb-auth-token', 'supabase.auth.token', 'supabase.auth.refreshToken'].forEach(key => {
      localStorage.removeItem(key);
    });

    // Sign out the user
    await supabase.auth.signOut();
    
    // Only redirect if we're not already on the auth page
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
  }
  return error;
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    await handleAuthError(error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    await handleAuthError(error);
    return { data: null, error };
  }
};

export const subscribeToTopic = (topicId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`topic:${topicId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'contents',
      filter: `topic_id=eq.${topicId}`
    }, callback)
    .subscribe();
};

export const subscribeToMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`messages:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, callback)
    .subscribe();
};