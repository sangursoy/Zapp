import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import { handleError } from '../utils/errorHandler';

export interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  profile_completed: boolean;
  profile_setup_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (mounted) {
          setProfile(data as Profile);
        }
      } catch (error) {
        const appError = handleError(error);
        toast.error(appError.message);
        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadProfile();
      })
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [userId, toast]);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!userId) throw new Error('No user ID available');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const appError = handleError(error);
      toast.error(appError.message);
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile
  };
}