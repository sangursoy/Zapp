import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

interface ProfileData {
  username: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar_url?: string;
}

interface UserProfileContextType {
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  fetchUserProfile: (userId: string) => Promise<any>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: ProfileData) => Promise<{ success: boolean; error: string | null }>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const toast = useToast();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentUserId(userId);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Profile not found
          return null;
        }
        throw fetchError;
      }

      if (data) {
        const profile = {
          id: data.user_id,
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          avatarUrl: data.avatar_url,
          bio: data.bio || '',
          profile_completed: data.profile_completed,
          interests: [],
          favoriteSubcategories: [],
          savedContents: [],
          contributedContents: []
        };
        
        setUserProfile(profile);
        return profile;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshUserProfile = useCallback(async () => {
    if (currentUserId) {
      await fetchUserProfile(currentUserId);
    }
  }, [currentUserId, fetchUserProfile]);

  const updateUserProfile = async (profileData: ProfileData) => {
    try {
      if (!currentUserId) {
        throw new Error('No user ID available');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUserId,
          ...profileData,
          profile_completed: true,
          profile_setup_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      await refreshUserProfile();
      toast.success('Profile updated successfully');
      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <UserProfileContext.Provider
      value={{
        userProfile,
        loading,
        error,
        fetchUserProfile,
        refreshUserProfile,
        updateUserProfile
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};