/*
  # Create Test User Profile

  1. Changes
    - Insert test user into auth.users
    - Create corresponding profile with complete information
    - Add test user's interests and saved contents
*/

-- Insert test user into auth.users
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  jsonb_build_object(
    'role', 'user',
    'first_name', 'John',
    'last_name', 'Doe'
  )
) ON CONFLICT (id) DO NOTHING;

-- Create profile for test user
INSERT INTO public.profiles (
  user_id,
  username,
  first_name,
  last_name,
  bio,
  avatar_url,
  profile_completed,
  profile_setup_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'johndoe',
  'John',
  'Doe',
  'Tech enthusiast and photography lover. Always exploring new places and sharing interesting stories.',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  true,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Add user interests
INSERT INTO public.user_interests (user_id, category)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Technology'),
  ('00000000-0000-0000-0000-000000000000', 'Culture'),
  ('00000000-0000-0000-0000-000000000000', 'Sports')
ON CONFLICT DO NOTHING;

-- Add some test content
INSERT INTO public.topics (
  id,
  title,
  category,
  location,
  trending,
  image_url,
  is_official
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Latest Tech Trends 2025',
  'Technology',
  'Istanbul',
  true,
  'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
  true
) ON CONFLICT DO NOTHING;

-- Add test content
INSERT INTO public.contents (
  id,
  topic_id,
  user_id,
  type,
  title,
  description,
  media_url,
  is_external,
  status
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'image',
  'The Future of AI',
  'Exploring the latest developments in artificial intelligence and machine learning.',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
  false,
  'published'
) ON CONFLICT DO NOTHING;

-- Add content tags
INSERT INTO public.content_tags (content_id, tag)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'AI'),
  ('22222222-2222-2222-2222-222222222222', 'Technology'),
  ('22222222-2222-2222-2222-222222222222', 'Future')
ON CONFLICT DO NOTHING;

-- Save some content for the user
INSERT INTO public.saved_contents (user_id, content_id)
VALUES ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Add some points for the user
INSERT INTO public.user_points (user_id, category, points, level)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Technology', 150, 3),
  ('00000000-0000-0000-0000-000000000000', 'Culture', 75, 2),
  ('00000000-0000-0000-0000-000000000000', 'Sports', 50, 1)
ON CONFLICT DO NOTHING;