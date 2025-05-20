import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ProfileTabs from '../components/profile/ProfileTabs';
import BottomNavigation from '../components/common/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';
import { MessageCircle, UserPlus, UserMinus, Loader2 } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { supabase, currentUser, contents } = useAppContext();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('profiles')
          .select(`
            user_id,
            username,
            first_name,
            last_name,
            avatar_url,
            bio,
            created_at
          `)
          .eq('username', username)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Profile not found');

        setProfile(data as User);

        // Check if following
        const { data: followData } = await supabase
          .from('user_followers')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', data.user_id)
          .single();

        setIsFollowing(!!followData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, supabase, currentUser.id]);

  const handleFollow = async () => {
    if (!profile) return;

    try {
      if (isFollowing) {
        await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.user_id);
      } else {
        await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.user_id
          });
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleMessage = () => {
    if (!profile) return;
    navigate(`/messages/${profile.user_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load profile</p>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-500 hover:text-orange-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get user's contents
  const userContents = contents.filter(content => content.userId === profile.user_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={profile.username} showBack />
      
      <main className="pb-20">
        <div className="bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <img 
                src={profile.avatar_url || 'https://via.placeholder.com/80'} 
                alt={profile.username} 
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div className="ml-4">
                <h1 className="text-xl font-bold">{profile.username}</h1>
                <p className="text-gray-600 text-sm mt-1">{profile.bio || 'No bio yet'}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span className="mr-4">{profile.first_name} {profile.last_name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleFollow}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-orange-500 text-white'
              }`}
            >
              {isFollowing ? (
                <div className="flex items-center justify-center">
                  <UserMinus size={18} className="mr-1" />
                  Unfollow
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus size={18} className="mr-1" />
                  Follow
                </div>
              )}
            </button>
            
            <button
              onClick={handleMessage}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm"
            >
              <div className="flex items-center justify-center">
                <MessageCircle size={18} className="mr-1" />
                Message
              </div>
            </button>
          </div>
        </div>

        <ProfileTabs 
          savedContents={[]} // Only show public saved contents
          contributedContents={userContents}
        />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default UserProfilePage;