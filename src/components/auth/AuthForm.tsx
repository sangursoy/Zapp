import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useUserProfile } from '../../context/UserProfileContext';
import { Loader2 } from 'lucide-react';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAppContext();
  const { userProfile, fetchUserProfile } = useUserProfile();
  
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!loading && user) {
        try {
          const profile = await fetchUserProfile(user.id);
          
          if (!profile?.profile_completed) {
            navigate('/setup-profile', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          navigate('/setup-profile', { replace: true });
        }
      }
    };

    checkUserAndRedirect();
  }, [user, loading, navigate, fetchUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Zapp
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Location-based topic platform
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#f97316',
                    brandAccent: '#ea580c'
                  }
                }
              }
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with',
                  link_text: 'Already have an account? Sign in'
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up...',
                  social_provider_text: 'Sign up with',
                  link_text: "Don't have an account? Sign up"
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthForm;