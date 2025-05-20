-- Create ENUMs if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM ('text', 'image', 'video');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'topic_category') THEN
        CREATE TYPE topic_category AS ENUM ('Sports', 'Finance', 'Health', 'Culture', 'Technology', 'Education', 'Entertainment', 'Politics', 'Science');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'community_role') THEN
        CREATE TYPE community_role AS ENUM ('creator', 'moderator', 'member');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'community_post_type') THEN
        CREATE TYPE community_post_type AS ENUM ('announcement', 'poll', 'media');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
        CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'analytics_event_type') THEN
        CREATE TYPE analytics_event_type AS ENUM ('view', 'like', 'share', 'comment');
    END IF;
END $$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS 
    analytics_events, external_sources, content_analytics, user_calendar_subscriptions,
    user_topic_subscriptions, calendar_topics, user_challenges, challenges, comments,
    user_badges, badges, user_points, community_posts, community_members, communities,
    messages, saved_contents, user_interests, content_tags, contents, topics, users CASCADE;

-- Drop existing triggers if they exist
DO $$
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
    DROP TRIGGER IF EXISTS update_contents_updated_at ON contents;
    DROP TRIGGER IF EXISTS check_profile_completion ON users;
    DROP TRIGGER IF EXISTS soft_delete_content ON contents;
    DROP TRIGGER IF EXISTS soft_delete_topic ON topics;
    DROP TRIGGER IF EXISTS soft_delete_community ON communities;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create users table with profile management
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar_url text,
  bio text,
  profile_completed boolean DEFAULT false,
  profile_setup_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (length(username) >= 3 AND length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT name_length CHECK (
    length(first_name) >= 1 AND 
    length(first_name) <= 50 AND
    length(last_name) >= 1 AND 
    length(last_name) <= 50
  )
);

-- Create topics table
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category topic_category NOT NULL,
  location text NOT NULL,
  trending boolean DEFAULT false,
  image_url text,
  is_official boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create contents table
CREATE TABLE contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type content_type NOT NULL,
  title text NOT NULL,
  description text,
  media_url text,
  is_external boolean DEFAULT false,
  external_source text,
  status content_status DEFAULT 'published',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT check_media_url CHECK (
    (type IN ('image', 'video') AND media_url IS NOT NULL) OR
    (type = 'text' AND (media_url IS NULL OR media_url = ''))
  ),
  CONSTRAINT check_external_source CHECK (
    (is_external = true AND external_source IS NOT NULL) OR
    (is_external = false AND external_source IS NULL)
  )
);

-- Create content_tags table
CREATE TABLE content_tags (
  content_id uuid REFERENCES contents ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY (content_id, tag)
);

-- Create user_interests table
CREATE TABLE user_interests (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  category topic_category NOT NULL,
  PRIMARY KEY (user_id, category)
);

-- Create saved_contents table
CREATE TABLE saved_contents (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content_id uuid REFERENCES contents ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES contents ON DELETE SET NULL,
  text text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create communities table
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
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
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create user_points table
CREATE TABLE user_points (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  category topic_category NOT NULL,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, category),
  CONSTRAINT check_points_positive CHECK (points >= 0),
  CONSTRAINT check_level_positive CHECK (level >= 1)
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

-- Create analytics_events table
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES contents ON DELETE CASCADE,
  event_type analytics_event_type NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read all users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Anyone can read topics" ON topics
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Anyone can read contents" ON contents
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can update own contents" ON contents
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read content tags" ON content_tags
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own saved contents" ON saved_contents
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Anyone can view communities" ON communities
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Anyone can view community members" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view community posts" ON community_posts
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Anyone can view user points" ON user_points
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view user badges" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view challenges" ON challenges
  FOR SELECT USING (true);

CREATE POLICY "Users can view own challenges" ON user_challenges
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view calendar topics" ON calendar_topics
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own topic subscriptions" ON user_topic_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own calendar subscriptions" ON user_calendar_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Content creators can view analytics" ON content_analytics
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM contents
    WHERE id = content_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view external sources" ON external_sources
  FOR SELECT USING (true);

CREATE POLICY "Content analytics are viewable by content owners" ON analytics_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM contents
    WHERE contents.id = analytics_events.content_id
    AND contents.user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_type_created_at ON contents(type, created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_saved_contents_user_id ON saved_contents(user_id);
CREATE INDEX idx_topics_category_location ON topics(category, location) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_analytics_views_engagement ON content_analytics(views, engagement_rate);
CREATE INDEX idx_users_profile_completed ON users(profile_completed);
CREATE INDEX idx_users_profile_setup_at ON users(profile_setup_at);
CREATE INDEX topics_is_official_idx ON topics(is_official);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION handle_new_user()
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

CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.user_points WHERE user_id = OLD.id;
  DELETE FROM public.user_interests WHERE user_id = OLD.id;
  DELETE FROM public.saved_contents WHERE user_id = OLD.id;
  DELETE FROM public.user_badges WHERE user_id = OLD.id;
  DELETE FROM public.user_challenges WHERE user_id = OLD.id;
  DELETE FROM public.user_topic_subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.user_calendar_subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers with existence checks
DO $$
BEGIN
    -- Check and create auth user triggers
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION handle_new_user();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_deleted' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        CREATE TRIGGER on_auth_user_deleted
            BEFORE DELETE ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION handle_user_deletion();
    END IF;

    -- Check and create other triggers
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_users_updated_at' 
        AND tgrelid = 'users'::regclass
    ) THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_topics_updated_at' 
        AND tgrelid = 'topics'::regclass
    ) THEN
        CREATE TRIGGER update_topics_updated_at
            BEFORE UPDATE ON topics
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_contents_updated_at' 
        AND tgrelid = 'contents'::regclass
    ) THEN
        CREATE TRIGGER update_contents_updated_at
            BEFORE UPDATE ON contents
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;

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

-- Create views
CREATE OR REPLACE VIEW user_profiles_with_points AS
SELECT 
  u.id,
  u.username,
  u.first_name,
  u.last_name,
  u.avatar_url,
  u.bio,
  u.created_at,
  COALESCE(json_object_agg(up.category, json_build_object(
    'points', up.points,
    'level', up.level
  )) FILTER (WHERE up.category IS NOT NULL), '{}') as category_points,
  COALESCE(SUM(up.points), 0) as total_points,
  COALESCE(ROUND(AVG(up.level)), 1) as average_level
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
GROUP BY u.id;

CREATE OR REPLACE VIEW content_analytics_summary AS
SELECT 
  c.id as content_id,
  c.title,
  c.type,
  t.category,
  ca.views,
  ca.unique_views,
  ca.engagement_rate,
  COUNT(cm.id) as comment_count,
  COUNT(DISTINCT sc.user_id) as save_count,
  COALESCE(json_agg(DISTINCT ct.tag) FILTER (WHERE ct.tag IS NOT NULL), '[]') as tags
FROM contents c
JOIN topics t ON c.topic_id = t.id
LEFT JOIN content_analytics ca ON c.id = ca.content_id
LEFT JOIN comments cm ON c.id = cm.content_id
LEFT JOIN saved_contents sc ON c.id = sc.content_id
LEFT JOIN content_tags ct ON c.id = ct.content_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.title, c.type, t.category, ca.views, ca.unique_views, ca.engagement_rate;

CREATE OR REPLACE VIEW topic_statistics AS
SELECT 
  t.id as topic_id,
  t.title,
  t.category,
  t.location,
  COUNT(DISTINCT c.id) as content_count,
  COUNT(DISTINCT cm.id) as comment_count,
  COUNT(DISTINCT uts.user_id) as subscriber_count,
  COALESCE(SUM(ca.views), 0) as total_views,
  COALESCE(AVG(ca.engagement_rate), 0) as avg_engagement_rate,
  t.created_at,
  t.updated_at
FROM topics t
LEFT JOIN contents c ON t.id = c.topic_id AND c.deleted_at IS NULL
LEFT JOIN comments cm ON c.id = cm.content_id
LEFT JOIN user_topic_subscriptions uts ON t.id = uts.topic_id
LEFT JOIN content_analytics ca ON c.id = ca.content_id
WHERE t.deleted_at IS NULL
GROUP BY t.id;

-- Add comments
COMMENT ON TABLE users IS 'User profiles and account information';
COMMENT ON COLUMN users.profile_completed IS 'Indicates if user has completed their profile setup';
COMMENT ON COLUMN users.profile_setup_at IS 'Timestamp when user completed their profile setup';
COMMENT ON COLUMN contents.deleted_at IS 'Timestamp when the content was soft deleted';
COMMENT ON COLUMN topics.deleted_at IS 'Timestamp when the topic was soft deleted';
COMMENT ON COLUMN communities.deleted_at IS 'Timestamp when the community was soft deleted';
COMMENT ON VIEW user_profiles_with_points IS 'Aggregated view of user profiles with their points and levels across categories';
COMMENT ON VIEW content_analytics_summary IS 'Summary view of content performance metrics and engagement';
COMMENT ON VIEW topic_statistics IS 'Aggregated statistics for topics including content and engagement metrics';
COMMENT ON TRIGGER check_profile_completion ON users IS 'Automatically updates profile completion status';