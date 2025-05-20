-- Update profile with random values for any null fields
UPDATE public.profiles
SET
  bio = COALESCE(bio, 'Tech enthusiast and digital explorer. Always learning and sharing interesting discoveries.'),
  avatar_url = COALESCE(avatar_url, 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'),
  updated_at = NOW()
WHERE user_id = 'e8922fbb-d439-44cc-a74b-9cdd17bdc085';

-- Add more user interests if none exist
INSERT INTO public.user_interests (user_id, category)
SELECT 'e8922fbb-d439-44cc-a74b-9cdd17bdc085', category::topic_category
FROM (VALUES 
  ('Technology'::topic_category),
  ('Entertainment'::topic_category),
  ('Science'::topic_category),
  ('Education'::topic_category)
) AS categories(category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_interests 
  WHERE user_id = 'e8922fbb-d439-44cc-a74b-9cdd17bdc085'
  AND category = categories.category
);

-- Add user points for each category
INSERT INTO public.user_points (user_id, category, points, level)
SELECT 'e8922fbb-d439-44cc-a74b-9cdd17bdc085', category::topic_category, points, level
FROM (VALUES 
  ('Technology'::topic_category, 250, 3),
  ('Entertainment'::topic_category, 150, 2),
  ('Science'::topic_category, 175, 2),
  ('Education'::topic_category, 100, 1)
) AS points(category, points, level)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_points 
  WHERE user_id = 'e8922fbb-d439-44cc-a74b-9cdd17bdc085'
  AND category = points.category
);

-- Add favorite subcategories
INSERT INTO public.user_favorite_subcategories (user_id, category, subcategory)
SELECT 'e8922fbb-d439-44cc-a74b-9cdd17bdc085', category::topic_category, subcategory
FROM (VALUES 
  ('Technology'::topic_category, 'Artificial Intelligence'),
  ('Technology'::topic_category, 'Mobile Tech'),
  ('Science'::topic_category, 'Computer Science'),
  ('Entertainment'::topic_category, 'Gaming'),
  ('Education'::topic_category, 'Online Learning')
) AS subcategories(category, subcategory)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_favorite_subcategories 
  WHERE user_id = 'e8922fbb-d439-44cc-a74b-9cdd17bdc085'
  AND category = subcategories.category
  AND subcategory = subcategories.subcategory
);

-- Create some sample content for the user
INSERT INTO public.topics (id, title, category, location, trending, image_url, is_official)
VALUES (
  'a1b2c3d4-e5f6-4321-8765-9abc12345678',
  'Future of Mobile Development',
  'Technology'::topic_category,
  'Istanbul',
  true,
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
  false
) ON CONFLICT DO NOTHING;

-- Add content created by the user
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
  'b2c3d4e5-f6a7-5432-8765-abcd23456789',
  'a1b2c3d4-e5f6-4321-8765-9abc12345678',
  'e8922fbb-d439-44cc-a74b-9cdd17bdc085',
  'image'::content_type,
  'Next-Gen Mobile Development Trends',
  'Exploring the latest trends and technologies shaping the future of mobile app development.',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
  false,
  'published'::content_status
) ON CONFLICT DO NOTHING;

-- Add tags to the content
INSERT INTO public.content_tags (content_id, tag)
VALUES 
  ('b2c3d4e5-f6a7-5432-8765-abcd23456789', 'MobileDev'),
  ('b2c3d4e5-f6a7-5432-8765-abcd23456789', 'Technology'),
  ('b2c3d4e5-f6a7-5432-8765-abcd23456789', 'Innovation')
ON CONFLICT DO NOTHING;

-- Add some analytics for the content
INSERT INTO public.content_analytics (
  content_id,
  views,
  unique_views,
  engagement_rate,
  demographics,
  updated_at
) VALUES (
  'b2c3d4e5-f6a7-5432-8765-abcd23456789',
  156,
  89,
  0.45,
  '{"age_groups": {"18-24": 0.3, "25-34": 0.5, "35-44": 0.2}, "locations": {"Istanbul": 0.6, "Ankara": 0.25, "Izmir": 0.15}}',
  NOW()
) ON CONFLICT DO NOTHING;

-- Add some saved content for the user
INSERT INTO public.saved_contents (user_id, content_id)
VALUES ('e8922fbb-d439-44cc-a74b-9cdd17bdc085', 'b2c3d4e5-f6a7-5432-8765-abcd23456789')
ON CONFLICT DO NOTHING;