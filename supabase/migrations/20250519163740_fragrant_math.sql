/*
  # User Experience and Interface Enhancements

  1. Changes
    - Add user roles (admin/user)
    - Add profile completion tracking
    - Add soft delete functionality
    - Improve RLS policies
    - Add necessary indexes

  2. Security
    - Add role-based access control
    - Enhance data protection
*/

-- Create ENUMs if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
END $$;

-- Add role column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

-- Add profile completion fields if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_setup_at timestamptz;

-- Add soft delete columns if they don't exist
ALTER TABLE contents 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Create or replace profile completion function
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'check_profile_completion' 
    AND tgrelid = 'users'::regclass
  ) THEN
    CREATE TRIGGER check_profile_completion
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_profile_completion();
  END IF;
END $$;

-- Create or replace soft delete function
CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create soft delete triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'soft_delete_content' 
    AND tgrelid = 'contents'::regclass
  ) THEN
    CREATE TRIGGER soft_delete_content
      BEFORE UPDATE OF deleted_at ON contents
      FOR EACH ROW
      WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
      EXECUTE FUNCTION soft_delete_record();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'soft_delete_topic' 
    AND tgrelid = 'topics'::regclass
  ) THEN
    CREATE TRIGGER soft_delete_topic
      BEFORE UPDATE OF deleted_at ON topics
      FOR EACH ROW
      WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
      EXECUTE FUNCTION soft_delete_record();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'soft_delete_community' 
    AND tgrelid = 'communities'::regclass
  ) THEN
    CREATE TRIGGER soft_delete_community
      BEFORE UPDATE OF deleted_at ON communities
      FOR EACH ROW
      WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
      EXECUTE FUNCTION soft_delete_record();
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create new policies
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);
CREATE INDEX IF NOT EXISTS idx_users_profile_setup_at ON users(profile_setup_at);

-- Add comments
COMMENT ON COLUMN users.role IS 'User role (user or admin)';
COMMENT ON COLUMN users.profile_completed IS 'Indicates if user has completed their profile setup';
COMMENT ON COLUMN users.profile_setup_at IS 'Timestamp when user completed their profile setup';
COMMENT ON COLUMN contents.deleted_at IS 'Timestamp when the content was soft deleted';
COMMENT ON COLUMN topics.deleted_at IS 'Timestamp when the topic was soft deleted';
COMMENT ON COLUMN communities.deleted_at IS 'Timestamp when the community was soft deleted';