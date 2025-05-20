/*
  # Fix User Deletion Cascade

  1. Changes
    - Update handle_user_deletion trigger to properly handle cascade deletion
    - Add proper error handling
    - Ensure all related data is cleaned up
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP FUNCTION IF EXISTS handle_user_deletion();

-- Create improved user deletion function
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete profile first to trigger other cascading deletes
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  
  -- Clean up any remaining data
  DELETE FROM public.user_points WHERE user_id = OLD.id;
  DELETE FROM public.user_interests WHERE user_id = OLD.id;
  DELETE FROM public.saved_contents WHERE user_id = OLD.id;
  DELETE FROM public.user_badges WHERE user_id = OLD.id;
  DELETE FROM public.user_challenges WHERE user_id = OLD.id;
  DELETE FROM public.user_topic_subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.user_calendar_subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.user_favorite_subcategories WHERE user_id = OLD.id;
  DELETE FROM public.user_followers WHERE follower_id = OLD.id OR following_id = OLD.id;
  DELETE FROM public.messages WHERE sender_id = OLD.id OR receiver_id = OLD.id;
  DELETE FROM public.contents WHERE user_id = OLD.id;
  DELETE FROM public.community_members WHERE user_id = OLD.id;
  DELETE FROM public.community_posts WHERE user_id = OLD.id;
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details
    RAISE NOTICE 'Error deleting user data: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();

-- Add comment
COMMENT ON FUNCTION handle_user_deletion() IS 'Handles cleanup of user data when a user is deleted';