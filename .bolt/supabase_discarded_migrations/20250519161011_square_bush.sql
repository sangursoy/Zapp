/*
  # Create Example User: Şan Gürsoy
  
  1. Create auth user
  2. Insert user profile data
  3. Add interests and favorite subcategories
*/

-- Insert example user into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d',
  '00000000-0000-0000-0000-000000000000',
  'san.gursoy@example.com',
  crypt('example-password', gen_salt('bf')),
  now(),
  jsonb_build_object(
    'username', 'sangursoy',
    'first_name', 'Şan',
    'last_name', 'Gürsoy'
  ),
  now(),
  now()
);

-- Insert user profile
INSERT INTO public.users (
  id,
  username,
  first_name,
  last_name,
  avatar_url,
  bio,
  created_at,
  updated_at
) VALUES (
  '4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d',
  'sangursoy',
  'Şan',
  'Gürsoy',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
  'Tech enthusiast and photography lover. Always exploring new places and capturing moments.',
  now(),
  now()
);

-- Add user interests
INSERT INTO public.user_interests (user_id, category) VALUES
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Technology'),
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Culture'),
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Entertainment');

-- Add favorite subcategories
INSERT INTO public.user_favorite_subcategories (user_id, category, subcategory) VALUES
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Technology', 'Mobile Tech'),
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Technology', 'Photography'),
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Culture', 'Art'),
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Entertainment', 'Movies');

-- Add initial points
INSERT INTO public.user_points (user_id, category, points, level) VALUES
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Technology', 150, 3),
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Culture', 75, 2),
  ('4a5c7b9d-8f2e-4c1a-b6d3-7e9a2f5b8c4d', 'Entertainment', 100, 2);