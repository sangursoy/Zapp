/*
  # Advanced Features Schema

  1. New Types
    - community_role (ENUM)
    - community_post_type (ENUM)

  2. New Tables
    - communities
    - community_members
    - community_posts
    - user_points
    - badges
    - user_badges
    - comments
    - challenges
    - user_challenges
    - calendar_topics
    - user_subscriptions
    - content_analytics
    - external_sources

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create new ENUMs
CREATE TYPE community_role AS ENUM ('creator', 'moderator', 'member');
CREATE TYPE community_post_type AS ENUM ('announcement', 'poll', 'media');

-- Create communities table
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create community_members table
CREATE TABLE community_members (
  community_id uuid REFERENCES communities ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role community_role NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

-- Create community_posts table
CREATE TABLE community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  type community_post_type NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_points table
CREATE TABLE user_points (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  category topic_category NOT NULL,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, category)
);

-- Create badges table
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  requirements jsonb NOT NULL
);

-- Create user_badges table
CREATE TABLE user_badges (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  badge_id uuid REFERENCES badges ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES contents ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  text text NOT NULL,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create challenges table
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category topic_category NOT NULL,
  requirements jsonb NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL
);

-- Create user_challenges table
CREATE TABLE user_challenges (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges ON DELETE CASCADE,
  progress jsonb DEFAULT '{}',
  completed_at timestamptz,
  PRIMARY KEY (user_id, challenge_id)
);

-- Create calendar_topics table
CREATE TABLE calendar_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category topic_category NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL
);

-- Create user_topic_subscriptions table
CREATE TABLE user_topic_subscriptions (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  topic_id uuid REFERENCES topics ON DELETE CASCADE,
  notify boolean DEFAULT true,
  PRIMARY KEY (user_id, topic_id)
);

-- Create user_calendar_subscriptions table
CREATE TABLE user_calendar_subscriptions (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  calendar_topic_id uuid REFERENCES calendar_topics ON DELETE CASCADE,
  notify boolean DEFAULT true,
  PRIMARY KEY (user_id, calendar_topic_id)
);

-- Create content_analytics table
CREATE TABLE content_analytics (
  content_id uuid REFERENCES contents ON DELETE CASCADE PRIMARY KEY,
  views integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  engagement_rate float DEFAULT 0,
  demographics jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Create external_sources table
CREATE TABLE external_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  category topic_category NOT NULL,
  data jsonb NOT NULL,
  imported_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Communities
CREATE POLICY "Anyone can view communities" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT TO authenticated WITH CHECK (true);

-- Community Members
CREATE POLICY "Anyone can view community members" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Community Posts
CREATE POLICY "Anyone can view community posts" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "Community members can create posts" ON community_posts
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid()
    )
  );

-- User Points
CREATE POLICY "Anyone can view user points" ON user_points
  FOR SELECT USING (true);

-- Badges
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- User Badges
CREATE POLICY "Anyone can view user badges" ON user_badges
  FOR SELECT USING (true);

-- Comments
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Challenges
CREATE POLICY "Anyone can view challenges" ON challenges
  FOR SELECT USING (true);

-- User Challenges
CREATE POLICY "Users can view own challenges" ON user_challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Calendar Topics
CREATE POLICY "Anyone can view calendar topics" ON calendar_topics
  FOR SELECT USING (true);

-- User Topic Subscriptions
CREATE POLICY "Users can manage own topic subscriptions" ON user_topic_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- User Calendar Subscriptions
CREATE POLICY "Users can manage own calendar subscriptions" ON user_calendar_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Content Analytics
CREATE POLICY "Content creators can view analytics" ON content_analytics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM contents 
      WHERE id = content_id 
      AND user_id = auth.uid()
    )
  );

-- External Sources
CREATE POLICY "Anyone can view external sources" ON external_sources
  FOR SELECT USING (true);

-- Create function to update user points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update points based on action type
  -- This is a simplified example
  UPDATE user_points
  SET 
    points = points + 
      CASE 
        WHEN NEW.type = 'like' THEN 1
        WHEN NEW.type = 'comment' THEN 2
        WHEN NEW.type = 'share' THEN 3
        ELSE 0
      END,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating user points
CREATE TRIGGER on_content_interaction
  AFTER INSERT ON contents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();