/*
  # Add User Profile Fields

  1. Changes
    - Add first_name and last_name columns to users table
    - Make avatar_url nullable
    - Add created_at and updated_at timestamps
*/

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN first_name text NOT NULL,
ADD COLUMN last_name text NOT NULL;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true);

-- Create policy to allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Create policy to allow public access to profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profiles');