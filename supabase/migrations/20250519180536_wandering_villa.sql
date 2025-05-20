/*
  # Add User Followers Support

  1. New Tables
    - user_followers
      - follower_id (uuid, references auth.users)
      - following_id (uuid, references auth.users)
      - created_at (timestamptz)
      - PRIMARY KEY (follower_id, following_id)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create user_followers table
CREATE TABLE user_followers (
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

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

-- Create indexes
CREATE INDEX idx_user_followers_follower ON user_followers(follower_id);
CREATE INDEX idx_user_followers_following ON user_followers(following_id);

-- Add comments
COMMENT ON TABLE user_followers IS 'Tracks user follow relationships';
COMMENT ON COLUMN user_followers.follower_id IS 'The user who is following';
COMMENT ON COLUMN user_followers.following_id IS 'The user being followed';