/*
  # Database Optimizations

  1. Changes
    - Add soft delete functionality
    - Add check constraints
    - Create useful views
    - Add composite indexes
    - Update RLS policies
    - Add triggers for soft deletes
*/

-- Add soft delete columns
ALTER TABLE contents ADD COLUMN deleted_at timestamptz;
ALTER TABLE topics ADD COLUMN deleted_at timestamptz;
ALTER TABLE communities ADD COLUMN deleted_at timestamptz;
ALTER TABLE community_posts ADD COLUMN deleted_at timestamptz;

-- Add check constraints
ALTER TABLE contents
ADD CONSTRAINT check_media_url
CHECK (
  (type IN ('image', 'video') AND media_url IS NOT NULL) OR
  (type = 'text' AND (media_url IS NULL OR media_url = ''))
);

ALTER TABLE contents
ADD CONSTRAINT check_external_source
CHECK (
  (is_external = true AND external_source IS NOT NULL) OR
  (is_external = false AND external_source IS NULL)
);

ALTER TABLE user_points
ADD CONSTRAINT check_points_positive
CHECK (points >= 0);

ALTER TABLE user_points
ADD CONSTRAINT check_level_positive
CHECK (level >= 1);

-- Create view for user profiles with points
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

-- Create view for content analytics
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

-- Create view for topic statistics
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

-- Add composite indexes
CREATE INDEX idx_contents_type_created_at ON contents(type, created_at)
WHERE deleted_at IS NULL;

CREATE INDEX idx_topics_category_location ON topics(category, location)
WHERE deleted_at IS NULL;

CREATE INDEX idx_content_analytics_views_engagement ON content_analytics(views, engagement_rate);

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read contents" ON contents;
DROP POLICY IF EXISTS "Anyone can read topics" ON topics;
DROP POLICY IF EXISTS "Anyone can view communities" ON communities;

-- Create new policies
CREATE POLICY "Anyone can read contents" ON contents
FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Anyone can read topics" ON topics
FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Anyone can view communities" ON communities
FOR SELECT USING (deleted_at IS NULL);

-- Add function to soft delete records
CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for soft delete
CREATE TRIGGER soft_delete_content
  BEFORE UPDATE OF deleted_at ON contents
  FOR EACH ROW
  WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
  EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER soft_delete_topic
  BEFORE UPDATE OF deleted_at ON topics
  FOR EACH ROW
  WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
  EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER soft_delete_community
  BEFORE UPDATE OF deleted_at ON communities
  FOR EACH ROW
  WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
  EXECUTE FUNCTION soft_delete_record();

-- Add comments
COMMENT ON VIEW user_profiles_with_points IS 'Aggregated view of user profiles with their points and levels across categories';
COMMENT ON VIEW content_analytics_summary IS 'Summary view of content performance metrics and engagement';
COMMENT ON VIEW topic_statistics IS 'Aggregated statistics for topics including content and engagement metrics';

COMMENT ON COLUMN contents.deleted_at IS 'Timestamp when the content was soft deleted';
COMMENT ON COLUMN topics.deleted_at IS 'Timestamp when the topic was soft deleted';
COMMENT ON COLUMN communities.deleted_at IS 'Timestamp when the community was soft deleted';