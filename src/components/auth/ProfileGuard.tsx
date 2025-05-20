import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { isProfileComplete } from '../../utils/profileUtils';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { user, userProfile, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isProfileComplete(userProfile) && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  return <>{children}</>;
};

export default ProfileGuard;