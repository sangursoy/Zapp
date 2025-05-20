/*
  # Add is_official flag to topics table

  1. Changes
    - Add is_official boolean column to topics table with default false
    - Update existing topics to set is_official = true for news topics
*/

-- Add is_official column to topics table
ALTER TABLE topics ADD COLUMN is_official boolean DEFAULT false;

-- Create index for faster filtering
CREATE INDEX topics_is_official_idx ON topics(is_official);

-- Update RLS policies to allow the service role to update official topics
CREATE POLICY "Service role can manage official topics"
  ON topics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);