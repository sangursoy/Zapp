-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_followers' 
    AND policyname = 'Anyone can view followers'
  ) THEN
    DROP POLICY "Anyone can view followers" ON user_followers;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_followers' 
    AND policyname = 'Users can manage own follows'
  ) THEN
    DROP POLICY "Users can manage own follows" ON user_followers;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Anyone can view followers"
ON user_followers FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage own follows"
ON user_followers
FOR ALL
TO authenticated
USING (follower_id = auth.uid())
WITH CHECK (follower_id = auth.uid());

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_followers_follower ON user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following ON user_followers(following_id);

-- Add or update comments
COMMENT ON TABLE user_followers IS 'Tracks user follow relationships';
COMMENT ON COLUMN user_followers.follower_id IS 'The user who is following';
COMMENT ON COLUMN user_followers.following_id IS 'The user being followed';