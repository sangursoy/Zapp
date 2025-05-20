import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useUserProfile } from '../../context/UserProfileContext';
import FormField from '../common/FormField';
import { useForm } from '../../hooks/useForm';
import { profileSchema, type ProfileFormData } from '../../utils/validation';
import { handleError } from '../../utils/errorHandler';
import { useToast } from '../../hooks/useToast';

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { supabase, user, setUserProfile } = useAppContext();
  const { refreshUserProfile } = useUserProfile();
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  
  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue
  } = useForm<ProfileFormData>({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      bio: '',
      avatarUrl: ''
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      if (!user) return;

      try {
        // Check username availability
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', values.username)
          .neq('user_id', user.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingUser) {
          throw new Error('This username is already taken');
        }

        // Update profile
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            username: values.username,
            first_name: values.firstName,
            last_name: values.lastName,
            bio: values.bio || null,
            avatar_url: values.avatarUrl || null,
            profile_completed: true,
            profile_setup_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (updateError) throw updateError;

        // Update local profile state
        const updatedProfile = {
          id: user.id,
          username: values.username,
          first_name: values.firstName,
          last_name: values.lastName,
          avatar_url: values.avatarUrl || null,
          bio: values.bio || null,
          profile_completed: true,
          profile_setup_at: new Date().toISOString(),
          interests: [],
          favoriteSubcategories: [],
          savedContents: [],
          contributedContents: []
        };
        
        setUserProfile(updatedProfile);
        await refreshUserProfile();
        
        toast.success('Profile setup completed successfully!');
        navigate('/', { replace: true });
      } catch (error) {
        const appError = handleError(error);
        toast.error(appError.message);
        throw appError;
      }
    }
  });

  const isFormValid = 
    formData.username.trim() !== '' && 
    formData.firstName.trim() !== '' && 
    formData.lastName.trim() !== '' &&
    !Object.keys(errors).length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      setFieldValue('avatarUrl', publicUrl);
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      const appError = handleError(error);
      toast.error(appError.message);
      throw appError;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete your profile to personalize your experience
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full overflow-hidden bg-gray-100 ${
                  formData.avatarUrl ? '' : 'border-2 border-dashed border-gray-300'
                }`}>
                  {formData.avatarUrl ? (
                    <img 
                      src={formData.avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer shadow-lg ${
                    isUploading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
                  } text-white transition-colors`}
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || isSubmitting}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Add a profile picture (optional)
              </p>
            </div>

            <FormField
              label="Username"
              name="username"
              value={formData.username}
              onChange={(name, value) => handleChange(name, value)}
              onBlur={handleBlur}
              error={errors.username}
              touched={touched.username}
              required
              disabled={isSubmitting}
              placeholder="Choose a unique username"
            />

            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(name, value) => handleChange(name, value)}
              onBlur={handleBlur}
              error={errors.firstName}
              touched={touched.firstName}
              required
              disabled={isSubmitting}
            />

            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(name, value) => handleChange(name, value)}
              onBlur={handleBlur}
              error={errors.lastName}
              touched={touched.lastName}
              required
              disabled={isSubmitting}
            />

            <FormField
              label="About"
              name="bio"
              type="textarea"
              value={formData.bio || ''}
              onChange={(name, value) => handleChange(name, value)}
              onBlur={handleBlur}
              error={errors.bio}
              touched={touched.bio}
              disabled={isSubmitting}
              placeholder="Tell us about yourself..."
            />

            <button
              type="submit"
              disabled={isSubmitting || isUploading || !isFormValid}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isFormValid && !isSubmitting && !isUploading
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;