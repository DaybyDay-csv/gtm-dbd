-- Make user_id nullable in projects table for public access
ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies for public access
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

-- Allow anyone to create projects
CREATE POLICY "Anyone can create projects"
ON public.projects FOR INSERT
WITH CHECK (true);

-- Allow anyone to view their own projects (by project_id)
CREATE POLICY "Anyone can view projects"
ON public.projects FOR SELECT
USING (true);

-- Allow anyone to update projects
CREATE POLICY "Anyone can update projects"
ON public.projects FOR UPDATE
USING (true);

-- Allow anyone to delete projects
CREATE POLICY "Anyone can delete projects"
ON public.projects FOR DELETE
USING (true);

-- Update phase_outputs policies
DROP POLICY IF EXISTS "Users can create outputs for their projects" ON public.phase_outputs;
DROP POLICY IF EXISTS "Users can update outputs for their projects" ON public.phase_outputs;
DROP POLICY IF EXISTS "Users can view outputs for their projects" ON public.phase_outputs;

CREATE POLICY "Anyone can create phase outputs"
ON public.phase_outputs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view phase outputs"
ON public.phase_outputs FOR SELECT
USING (true);

CREATE POLICY "Anyone can update phase outputs"
ON public.phase_outputs FOR UPDATE
USING (true);

-- Update experiments policies
DROP POLICY IF EXISTS "Users can create experiments for their projects" ON public.experiments;
DROP POLICY IF EXISTS "Users can update experiments for their projects" ON public.experiments;
DROP POLICY IF EXISTS "Users can view experiments for their projects" ON public.experiments;

CREATE POLICY "Anyone can create experiments"
ON public.experiments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view experiments"
ON public.experiments FOR SELECT
USING (true);

CREATE POLICY "Anyone can update experiments"
ON public.experiments FOR UPDATE
USING (true);