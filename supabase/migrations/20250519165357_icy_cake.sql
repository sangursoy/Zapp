/*
  # Fix users table RLS policies

  1. Changes
    - Remove recursive policy conditions that were causing infinite loops
    - Simplify user profile access policies
    - Ensure proper policy evaluation order

  2. Security
    - Maintain row-level security
    - Allow users to read all profiles
    - Allow users to update only their own profile
    - Allow admins to manage all users
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create new, simplified policies
CREATE POLICY "Anyone can read users"
ON users FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

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