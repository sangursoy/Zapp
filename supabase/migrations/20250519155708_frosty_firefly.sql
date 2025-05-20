-- Create trigger function to create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_contents_user_id ON public.contents(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_contents_user_id ON public.saved_contents(user_id);

-- Update RLS policies to use auth.uid() consistently
ALTER POLICY "Users can update own profile" ON public.users
  USING (auth.uid() = id);

ALTER POLICY "Users can manage own interests" ON public.user_interests
  USING (auth.uid() = user_id);

ALTER POLICY "Users can manage own saved contents" ON public.saved_contents
  USING (auth.uid() = user_id);

ALTER POLICY "Users can read own messages" ON public.messages
  USING (auth.uid() IN (sender_id, receiver_id));

-- Add cascade delete triggers
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up related data
  DELETE FROM public.user_points WHERE user_id = OLD.id;
  DELETE FROM public.user_interests WHERE user_id = OLD.id;
  DELETE FROM public.saved_contents WHERE user_id = OLD.id;
  DELETE FROM public.user_badges WHERE user_id = OLD.id;
  DELETE FROM public.user_challenges WHERE user_id = OLD.id;
  DELETE FROM public.user_topic_subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.user_calendar_subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.user_favorite_subcategories WHERE user_id = OLD.id;
  
  -- Delete user profile last
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();