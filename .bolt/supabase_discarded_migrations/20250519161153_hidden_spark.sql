/*
  # User Management System

  1. Changes
    - Add soft delete function
    - Add updated_at trigger function
    - Add user management triggers
    - Add performance indexes
    - Update security policies

  2. Security
    - All functions use SECURITY DEFINER
    - Proper permission handling
*/

-- Create soft delete function
CREATE OR REPLACE FUNCTION public.soft_delete_record()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archive related records
  IF TG_TABLE_NAME = 'topics' THEN
    UPDATE contents SET deleted_at = NOW() WHERE topic_id = OLD.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    username,
    first_name,
    last_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- Add indexes for better query performance
DO $$
BEGIN
  -- Create index for usernames if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND indexname = 'idx_users_username'
  ) THEN
    CREATE INDEX idx_users_username ON public.users(username);
  END IF;
  
  -- Create index for created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND indexname = 'idx_users_created_at'
  ) THEN
    CREATE INDEX idx_users_created_at ON public.users(created_at);
  END IF;
END $$;

-- Add comments
COMMENT ON FUNCTION public.handle_new_user IS 'Creates a basic user profile when a new user registers';
COMMENT ON FUNCTION public.handle_user_deletion IS 'Cleans up user profile when auth user is deleted';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates user profile on registration';
COMMENT ON TRIGGER on_auth_user_deleted ON auth.users IS 'Automatically removes user profile on deletion';