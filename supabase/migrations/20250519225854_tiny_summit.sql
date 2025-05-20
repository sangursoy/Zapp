-- Insert user profile data for e8922fbb-d439-44cc-a74b-9cdd17bdc085
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data
) VALUES (
  'e8922fbb-d439-44cc-a74b-9cdd17bdc085',
  'user@example.com',
  jsonb_build_object(
    'role', 'user',
    'first_name', 'Test',
    'last_name', 'User'
  )
) ON CONFLICT (id) DO NOTHING;

-- Create profile
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
  'e8922fbb-d439-44cc-a74b-9cdd17bdc085',
  'testuser',
  'Test',
  'User',
  'Just exploring and sharing interesting content',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
  true,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Add user interests
INSERT INTO public.user_interests (user_id, category)
VALUES 
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Technology'),
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Entertainment'),
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Science')
ON CONFLICT DO NOTHING;

-- Add some initial points
INSERT INTO public.user_points (user_id, category, points, level)
VALUES 
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Technology', 100, 2),
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Entertainment', 50, 1),
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Science', 75, 2)
ON CONFLICT DO NOTHING;

-- Add some favorite subcategories
INSERT INTO public.user_favorite_subcategories (user_id, category, subcategory)
VALUES
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Technology', 'Artificial Intelligence'),
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Technology', 'Mobile Tech'),
  ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'Science', 'Computer Science')
ON CONFLICT DO NOTHING;