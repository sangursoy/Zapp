/*
  # Optimize RLS Policies Performance

  1. Changes
    - Update user_interests policy to use subquery for better performance
    - Add similar optimizations to other policies using auth.uid()
*/

-- Update user_interests policy for better performance
DROP POLICY IF EXISTS "Users can manage own interests" ON public.user_interests;
CREATE POLICY "Users can manage own interests" ON public.user_interests
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Update other policies for consistency and performance
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage own saved contents" ON public.saved_contents;
CREATE POLICY "Users can manage own saved contents" ON public.saved_contents
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id = (SELECT auth.uid()) OR 
    receiver_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage own favorite subcategories" ON public.user_favorite_subcategories;
CREATE POLICY "Users can manage own favorite subcategories" ON public.user_favorite_subcategories
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage own topic subscriptions" ON public.user_topic_subscriptions;
CREATE POLICY "Users can manage own topic subscriptions" ON public.user_topic_subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage own calendar subscriptions" ON public.user_calendar_subscriptions;
CREATE POLICY "Users can manage own calendar subscriptions" ON public.user_calendar_subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own challenges" ON public.user_challenges;
CREATE POLICY "Users can view own challenges" ON public.user_challenges
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Add comment explaining the optimization
COMMENT ON POLICY "Users can manage own interests" ON public.user_interests IS 
  'Optimized policy using subquery for auth.uid() to improve query performance';