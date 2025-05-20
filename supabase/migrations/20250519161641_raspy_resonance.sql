/*
  # Add Profile Management Features

  1. Changes
    - Add profile completion tracking
    - Add profile setup requirements
    - Update user triggers
    - Add profile validation constraints

  2. Security
    - Update RLS policies for profile management
*/

-- Add profile completion status
ALTER TABLE users 
ADD COLUMN profile_completed boolean DEFAULT false,
ADD COLUMN profile_setup_at timestamptz;

-- Add profile validation constraints
ALTER TABLE users
ADD CONSTRAINT username_length CHECK (length(username) >= 3 AND length(username) <= 30),
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
ADD CONSTRAINT name_length CHECK (
  length(first_name) >= 1 AND 
  length(first_name) <= 50 AND
  length(last_name) >= 1 AND 
  length(last_name) <= 50
);

-- Update handle_new_user function to set profile_completed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    username,
    first_name,
    last_name,
    profile_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8),
    'New',
    'User',
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update profile completion status
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all required fields are set
  IF NEW.username IS NOT NULL 
    AND NEW.first_name IS NOT NULL 
    AND NEW.last_name IS NOT NULL 
    AND NEW.username != 'user_' || substr(NEW.id::text, 1, 8)
  THEN
    NEW.profile_completed := true;
    NEW.profile_setup_at := COALESCE(NEW.profile_setup_at, NOW());
  ELSE
    NEW.profile_completed := false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile completion
CREATE TRIGGER check_profile_completion
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- Update RLS policies
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);
CREATE INDEX IF NOT EXISTS idx_users_profile_setup_at ON users(profile_setup_at);

-- Add comments
COMMENT ON COLUMN users.profile_completed IS 'Indicates if user has completed their profile setup';
COMMENT ON COLUMN users.profile_setup_at IS 'Timestamp when user completed their profile setup';
COMMENT ON TRIGGER check_profile_completion ON users IS 'Automatically updates profile completion status';