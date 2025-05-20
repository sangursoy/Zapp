import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Camera, Edit2, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import ProfileTabs from '../components/profile/ProfileTabs';
import BottomNavigation from '../components/common/BottomNavigation';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, loading, refreshUserProfile } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: ''
  });

  // Load test user profile
  useEffect(() => {
    const loadTestProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            user_id,
            username,
            first_name,
            last_name,
            avatar_url,
            bio,
            profile_completed,
            profile_setup_at,
            created_at,
            updated_at
          `)
          .eq('user_id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (error) throw error;

        // Load user interests
        const { data: interests } = await supabase
          .from('user_interests')
          .select('category')
          .eq('user_id', '00000000-0000-0000-0000-000000000000');

        // Load saved contents
        const { data: savedContents } = await supabase
          .from('saved_contents')
          .select('content_id')
          .eq('user_id', '00000000-0000-0000-0000-000000000000');

        // Load contributed contents
        const { data: contributedContents } = await supabase
          .from('contents')
          .select('id')
          .eq('user_id', '00000000-0000-0000-0000-000000000000');

        setUserProfile({
          id: profile.user_id,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          profile_completed: profile.profile_completed,
          profile_setup_at: profile.profile_setup_at,
          interests: interests?.map(i => i.category) || [],
          favoriteSubcategories: [],
          savedContents: savedContents?.map(s => s.content_id) || [],
          contributedContents: contributedContents?.map(c => c.id) || []
        });

        setFormData({
          username: profile.username,
          firstName: profile.first_name,
          lastName: profile.last_name,
          bio: profile.bio || ''
        });
      } catch (error) {
        console.error('Error loading test profile:', error);
        toast.error('Failed to load test profile');
      }
    };

    loadTestProfile();
  }, [setUserProfile, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    try {
      setIsUploading(true);
      toast.info('Uploading avatar...');

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userProfile.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userProfile.id);

      if (updateError) throw updateError;

      setUserProfile({ ...userProfile, avatar_url: publicUrl });
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    try {
      setIsSaving(true);

      // Validate inputs
      if (!formData.username.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('Username, first name, and last name are required');
      }

      // Check username format
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
        throw new Error('Username must be 3-30 characters and can only contain letters, numbers, and underscores');
      }

      const { error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .neq('user_id', userProfile.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userProfile.id);

      if (error) throw error;

      await refreshUserProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load profile</p>
          <button
            onClick={() => navigate('/auth')}
            className="text-orange-500 hover:text-orange-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={isEditing ? "Edit Profile" : "Profile"} 
        showBack={isEditing}
      />
      
      <main className="pb-20">
        <div className="bg-white p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                  {userProfile.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt={userProfile.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500">
                      <Camera size={32} />
                    </div>
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className={`absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer shadow-lg ${
                    isUploading ? 'bg-gray-400' : 'bg-orange-500'
                  } text-white`}
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              {isEditing ? (
                <div className="ml-4 flex-1">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Username"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
              ) : (
                <div className="ml-4">
                  <h1 className="text-xl font-bold">{userProfile.username}</h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {userProfile.first_name} {userProfile.last_name}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 flex items-center ${
                      isSaving ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    <Edit2 size={20} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    <LogOut size={20} className="text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Write something about yourself..."
                maxLength={500}
              />
            ) : (
              <p className="text-gray-600 text-sm">
                {userProfile.bio || 'No bio yet'}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {userProfile.interests?.map((interest, index) => (
              <span 
                key={index} 
                className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-white p-4">
          <h2 className="text-lg font-semibold mb-2">Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {userProfile.contributedContents?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {userProfile.savedContents?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {userProfile.interests?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Interests</p>
            </div>
          </div>
        </div>
        
        <ProfileTabs 
          savedContents={[]} 
          contributedContents={[]} 
        />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;