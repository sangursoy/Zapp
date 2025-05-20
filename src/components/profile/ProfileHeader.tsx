import React from 'react';
import { User } from '../../types';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <img 
            src={user.avatarUrl || 'https://via.placeholder.com/80'} 
            alt={user.username} 
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="ml-4">
            <h1 className="text-xl font-bold">{user.username}</h1>
            <p className="text-gray-600 text-sm mt-1">{user.bio || 'No bio yet'}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span className="mr-4">{user.first_name} {user.last_name}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleSettingsClick}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Interests:</p>
        <div className="flex flex-wrap gap-2">
          {user.interests?.map((interest, index) => (
            <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {interest}
            </span>
          )) || <span className="text-gray-500 text-sm">No interests added yet</span>}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;