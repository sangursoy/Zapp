/*
  # Setup Profile Images Storage

  1. Storage
    - Create profiles bucket if it doesn't exist
    - Set bucket to public for easy access
  
  2. Security
    - Add policy for authenticated users to upload their own avatars
    - Add policy for public access to profile images
*/

DO $$
BEGIN
  -- Create storage bucket for profile images if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profiles'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profiles', 'profiles', true);
  END IF;
END $$;

-- Create policy to allow authenticated users to upload their own avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can upload their own avatar'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profiles' AND
      (storage.foldername(name))[1] = 'avatars' AND
      auth.uid()::text = (storage.foldername(name))[2]
    );
  END IF;
END $$;

-- Create policy to allow public access to profile images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Profile images are publicly accessible'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Profile images are publicly accessible"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'profiles');
  END IF;
END $$;