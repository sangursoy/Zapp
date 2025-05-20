/*
  # Fix Users Table Policies

  1. Changes
    - Drop and recreate policies safely using DO blocks
    - Add missing indexes
    - Add table and column comments
*/

DO $$ 
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can read all users'
  ) THEN
    DROP POLICY "Users can read all users" ON users;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can update own profile'
  ) THEN
    DROP POLICY "Users can update own profile" ON users;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Admins can manage all users'
  ) THEN
    DROP POLICY "Admins can manage all users" ON users;
  END IF;

  -- Create new policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Anyone can read users'
  ) THEN
    CREATE POLICY "Anyone can read users"
    ON users FOR SELECT
    TO public
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Admins can manage all users'
  ) THEN
    CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM users admins
        WHERE admins.id = auth.uid()
        AND admins.role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users admins
        WHERE admins.id = auth.uid()
        AND admins.role = 'admin'
      )
    );
  END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);
CREATE INDEX IF NOT EXISTS idx_users_profile_setup_at ON users(profile_setup_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comments
COMMENT ON TABLE users IS 'User profiles and account information';
COMMENT ON COLUMN users.profile_completed IS 'Indicates if user has completed their profile setup';
COMMENT ON COLUMN users.profile_setup_at IS 'Timestamp when user completed their profile setup';
COMMENT ON COLUMN users.role IS 'User role (user or admin)';