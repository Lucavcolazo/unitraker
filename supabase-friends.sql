-- ════════════════════════════════════════════════════════
-- UniTraker — Friends + Profile Migration
-- Run this in Supabase SQL Editor AFTER the initial schema
-- ════════════════════════════════════════════════════════

-- 1. Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS degree_track TEXT DEFAULT 'ingeniero' CHECK (degree_track IN ('analista', 'ingeniero')),
  ADD COLUMN IF NOT EXISTS profile_color TEXT DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS profile_icon TEXT DEFAULT 'User';

-- 2. Friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_sender ON public.friendships(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON public.friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- 3. Updated_at trigger for friendships
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 4. RLS for friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can see friendships where they are sender or receiver
CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send friend requests (they must be the sender)
CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update friendships where they are the receiver (accept/reject)
CREATE POLICY "Receivers can update friendship status"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Users can delete friendships where they are involved
CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 5. Allow friends to read each other's subject states
CREATE POLICY "Friends can view each other states"
  ON public.subject_states FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (sender_id = auth.uid() AND receiver_id = user_id)
        OR (receiver_id = auth.uid() AND sender_id = user_id)
      )
    )
  );

-- 6. Allow users to search profiles by name/email (read only, limited fields)
CREATE POLICY "Users can search other profiles"
  ON public.profiles FOR SELECT
  USING (true);
