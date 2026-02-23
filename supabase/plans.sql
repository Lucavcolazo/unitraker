-- ════════════════════════════════════════════════════════
-- UniTraker — Custom Curriculum Plans Migration
-- Run this in Supabase SQL Editor
-- ════════════════════════════════════════════════════════

-- 1. Plans table
CREATE TABLE IF NOT EXISTS public.curriculum_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plans_creator ON public.curriculum_plans(creator_id);

-- 2. Plan subjects table
CREATE TABLE IF NOT EXISTS public.plan_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.curriculum_plans(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  year INT NOT NULL,
  semester INT NOT NULL DEFAULT 1,
  is_analyst BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'General',
  correlatives TEXT[] DEFAULT '{}',
  title_name TEXT,
  UNIQUE(plan_id, subject_id)
);

-- Si la tabla ya existía, agregar la columna
ALTER TABLE public.plan_subjects
  ADD COLUMN IF NOT EXISTS title_name TEXT;

CREATE INDEX IF NOT EXISTS idx_plan_subjects_plan ON public.plan_subjects(plan_id);

-- 3. Add active_plan_id to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_plan_id UUID REFERENCES public.curriculum_plans(id);

-- 4. RLS for curriculum_plans
ALTER TABLE public.curriculum_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public plans"
  ON public.curriculum_plans FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create plans"
  ON public.curriculum_plans FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own plans"
  ON public.curriculum_plans FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own plans"
  ON public.curriculum_plans FOR DELETE
  USING (auth.uid() = creator_id AND is_default = false);

-- 5. RLS for plan_subjects
ALTER TABLE public.plan_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subjects of accessible plans"
  ON public.plan_subjects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.curriculum_plans
    WHERE id = plan_id AND (is_public = true OR creator_id = auth.uid())
  ));

CREATE POLICY "Creators can insert subjects"
  ON public.plan_subjects FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.curriculum_plans
    WHERE id = plan_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can update subjects"
  ON public.plan_subjects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.curriculum_plans
    WHERE id = plan_id AND creator_id = auth.uid()
  ));

CREATE POLICY "Creators can delete subjects"
  ON public.plan_subjects FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.curriculum_plans
    WHERE id = plan_id AND creator_id = auth.uid()
  ));
