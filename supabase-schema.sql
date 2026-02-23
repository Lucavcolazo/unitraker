-- ════════════════════════════════════════════════════════
-- UniTraker — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ════════════════════════════════════════════════════════

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  curriculum_id TEXT DEFAULT 'sistemas-2024',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Subject states table (per user)
CREATE TABLE public.subject_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'regular', 'final', 'approved')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

-- 3. Indexes
CREATE INDEX idx_subject_states_user ON public.subject_states(user_id);
CREATE INDEX idx_subject_states_lookup ON public.subject_states(user_id, subject_id);

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subject_states_updated_at
  BEFORE UPDATE ON public.subject_states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 6. Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_states ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subject states: users can CRUD their own states
CREATE POLICY "Users can view own states"
  ON public.subject_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own states"
  ON public.subject_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own states"
  ON public.subject_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own states"
  ON public.subject_states FOR DELETE
  USING (auth.uid() = user_id);
