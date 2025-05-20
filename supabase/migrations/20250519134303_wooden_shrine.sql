/*
  # Add External Content Support and Analytics

  1. Changes
    - Add external_content_sources table for tracking content sources
    - Add content_status enum for tracking content lifecycle
    - Add content_source table for managing content origins
    - Add analytics_event_type enum for tracking different types of events

  2. Security
    - Enable RLS on new tables
    - Add appropriate policies for content management
*/

-- Create new ENUMs
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE analytics_event_type AS ENUM ('view', 'like', 'share', 'comment');

-- Add status column to contents table
ALTER TABLE contents ADD COLUMN status content_status DEFAULT 'published';

-- Create content_source table
CREATE TABLE content_source (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category topic_category NOT NULL,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  sync_frequency interval DEFAULT '1 hour',
  created_at timestamptz DEFAULT now()
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

-- Enable RLS
ALTER TABLE content_source ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view content sources"
  ON content_source FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage content sources"
  ON content_source FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Content analytics are viewable by content owners"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contents
      WHERE contents.id = analytics_events.content_id
      AND contents.user_id = auth.uid()
    )
  );

-- Add initial content sources
INSERT INTO content_source (name, url, category) VALUES
  ('TechCrunch', 'https://techcrunch.com', 'Technology'),
  ('ESPN', 'https://www.espn.com', 'Sports'),
  ('Reuters Business', 'https://www.reuters.com/business', 'Finance'),
  ('Nature', 'https://www.nature.com', 'Science'),
  ('WHO News', 'https://www.who.int/news', 'Health'),
  ('Education Week', 'https://www.edweek.org', 'Education'),
  ('Variety', 'https://variety.com', 'Entertainment'),
  ('Foreign Policy', 'https://foreignpolicy.com', 'Politics'),
  ('Arts & Culture', 'https://www.theartnewspaper.com', 'Culture');