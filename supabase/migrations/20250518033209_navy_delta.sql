/*
  # Initial Schema Setup for Lokalt Social App

  1. New Tables
    - users (extends Supabase auth.users)
      - id (uuid, from auth.users)
      - username (text)
      - avatar_url (text)
      - bio (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - topics
      - id (uuid)
      - title (text)
      - category (text)
      - location (text)
      - trending (boolean)
      - image_url (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - contents
      - id (uuid)
      - topic_id (uuid, references topics)
      - user_id (uuid, references auth.users)
      - type (text)
      - title (text)
      - description (text)
      - media_url (text)
      - is_external (boolean)
      - external_source (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - content_tags
      - content_id (uuid, references contents)
      - tag (text)
    
    - user_interests
      - user_id (uuid, references auth.users)
      - category (text)
    
    - saved_contents
      - user_id (uuid, references auth.users)
      - content_id (uuid, references contents)
      - created_at (timestamp)
    
    - messages
      - id (uuid)
      - sender_id (uuid, references auth.users)
      - receiver_id (uuid, references auth.users)
      - content_id (uuid, references contents)
      - text (text)
      - read (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create custom types
CREATE TYPE content_type AS ENUM ('text', 'image', 'video');
CREATE TYPE topic_category AS ENUM ('Sports', 'Finance', 'Health', 'Culture', 'Technology', 'Education', 'Entertainment', 'Politics', 'Science');

-- Create users table (extends auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create topics table
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category topic_category NOT NULL,
  location text NOT NULL,
  trending boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can read all users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Topics policies
CREATE POLICY "Anyone can read topics" ON topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON topics
  FOR INSERT TO authenticated WITH CHECK (true);

-- Contents policies
CREATE POLICY "Anyone can read contents" ON contents
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create contents" ON contents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contents" ON contents
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Content tags policies
CREATE POLICY "Anyone can read content tags" ON content_tags
  FOR SELECT USING (true);

CREATE POLICY "Content owners can manage tags" ON content_tags
  FOR ALL TO authenticated USING (
    auth.uid() IN (
      SELECT user_id FROM contents WHERE id = content_id
    )
  );

-- User interests policies
CREATE POLICY "Users can read own interests" ON user_interests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Saved contents policies
CREATE POLICY "Users can read own saved contents" ON saved_contents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved contents" ON saved_contents
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT TO authenticated USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();