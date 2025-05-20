/*
  # Restructure Users Table into Profiles

  1. Changes
    - Create new profiles table with correct schema
    - Migrate existing user data to profiles
    - Update references and policies
    - Drop old users table
*/

-- Create new profiles table
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  bio text,
  avatar_url text,
  profile_completed boolean DEFAULT false,
  profile_setup_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Create indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_profile_completed ON profiles(profile_completed);
CREATE INDEX idx_profiles_profile_setup_at ON profiles(profile_setup_at);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Create function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    username,
    first_name,
    last_name,
    profile_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL 
    AND NEW.first_name IS NOT NULL 
    AND NEW.last_name IS NOT NULL 
    AND NEW.username != 'user_' || substr(NEW.user_id::text, 1, 8)
  THEN
    NEW.profile_completed := true;
    NEW.profile_setup_at := COALESCE(NEW.profile_setup_at, NOW());
  ELSE
    NEW.profile_completed := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion
CREATE TRIGGER check_profile_completion
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Migrate data from users table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    INSERT INTO profiles (
      user_id,
      username,
      first_name,
      last_name,
      bio,
      avatar_url,
      profile_completed,
      profile_setup_at,
      created_at,
      updated_at
    )
    SELECT
      id,
      username,
      first_name,
      last_name,
      bio,
      avatar_url,
      profile_completed,
      profile_setup_at,
      created_at,
      updated_at
    FROM users
    ON CONFLICT (user_id) DO NOTHING;

    -- Drop old users table and related objects
    DROP TABLE IF EXISTS users CASCADE;
  END IF;
END $$;

-- Add comments
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON COLUMN profiles.user_id IS 'References the auth.users table';
COMMENT ON COLUMN profiles.username IS 'Unique username for the user';
COMMENT ON COLUMN profiles.profile_completed IS 'Indicates if user has completed their profile setup';
COMMENT ON COLUMN profiles.profile_setup_at IS 'Timestamp when user completed their profile setup';