/*
  # Add Subcategories and Favorites Support

  1. New Tables
    - category_subcategories
      - category (topic_category)
      - subcategory (text)
      - PRIMARY KEY (category, subcategory)
    
    - user_favorite_subcategories
      - user_id (uuid, references auth.users)
      - category (topic_category)
      - subcategory (text)
      - PRIMARY KEY (user_id, category, subcategory)
      
  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create category_subcategories table
CREATE TABLE category_subcategories (
  category topic_category NOT NULL,
  subcategory text NOT NULL,
  PRIMARY KEY (category, subcategory)
);

-- Create user_favorite_subcategories table
CREATE TABLE user_favorite_subcategories (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  category topic_category NOT NULL,
  subcategory text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, category, subcategory),
  FOREIGN KEY (category, subcategory) REFERENCES category_subcategories (category, subcategory) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE category_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read category subcategories" ON category_subcategories
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own favorite subcategories" ON user_favorite_subcategories
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Insert initial subcategories
INSERT INTO category_subcategories (category, subcategory) VALUES
  -- Sports
  ('Sports', 'Football'),
  ('Sports', 'Basketball'),
  ('Sports', 'Volleyball'),
  ('Sports', 'Tennis'),
  ('Sports', 'Swimming'),
  ('Sports', 'Athletics'),
  ('Sports', 'Boxing'),
  ('Sports', 'MMA'),
  ('Sports', 'Cricket'),
  ('Sports', 'Rugby'),
  
  -- Finance
  ('Finance', 'Stock Market'),
  ('Finance', 'Cryptocurrency'),
  ('Finance', 'Real Estate'),
  ('Finance', 'Personal Finance'),
  ('Finance', 'Banking'),
  ('Finance', 'Investment'),
  ('Finance', 'Insurance'),
  ('Finance', 'Taxes'),
  
  -- Health
  ('Health', 'Fitness'),
  ('Health', 'Nutrition'),
  ('Health', 'Mental Health'),
  ('Health', 'Yoga'),
  ('Health', 'Alternative Medicine'),
  ('Health', 'Medical Research'),
  ('Health', 'Public Health'),
  
  -- Culture
  ('Culture', 'Art'),
  ('Culture', 'Music'),
  ('Culture', 'Literature'),
  ('Culture', 'Theater'),
  ('Culture', 'Dance'),
  ('Culture', 'Fashion'),
  ('Culture', 'Food'),
  ('Culture', 'Traditions'),
  
  -- Technology
  ('Technology', 'Software Development'),
  ('Technology', 'Artificial Intelligence'),
  ('Technology', 'Cybersecurity'),
  ('Technology', 'Blockchain'),
  ('Technology', 'Mobile Tech'),
  ('Technology', 'Gaming'),
  ('Technology', 'Hardware'),
  ('Technology', 'Cloud Computing'),
  
  -- Education
  ('Education', 'Online Learning'),
  ('Education', 'Language Learning'),
  ('Education', 'STEM'),
  ('Education', 'Professional Development'),
  ('Education', 'Early Education'),
  ('Education', 'Higher Education'),
  ('Education', 'Special Education'),
  
  -- Entertainment
  ('Entertainment', 'Movies'),
  ('Entertainment', 'TV Shows'),
  ('Entertainment', 'Video Games'),
  ('Entertainment', 'Streaming'),
  ('Entertainment', 'Podcasts'),
  ('Entertainment', 'Celebrities'),
  ('Entertainment', 'Live Events'),
  
  -- Politics
  ('Politics', 'Local Politics'),
  ('Politics', 'National Politics'),
  ('Politics', 'International Relations'),
  ('Politics', 'Policy'),
  ('Politics', 'Elections'),
  ('Politics', 'Activism'),
  ('Politics', 'Legislation'),
  
  -- Science
  ('Science', 'Physics'),
  ('Science', 'Chemistry'),
  ('Science', 'Biology'),
  ('Science', 'Astronomy'),
  ('Science', 'Environmental Science'),
  ('Science', 'Neuroscience'),
  ('Science', 'Computer Science');