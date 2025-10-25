-- Allow unauthenticated users to create projects initially
-- Then they can claim ownership after signup

-- Drop existing RLS policies for projects
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

-- Update projects table to allow null user_id temporarily
ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;

-- Create new RLS policies that allow unauthenticated project creation
CREATE POLICY "Anyone can create projects"
ON public.projects
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own projects or unclaimed projects
CREATE POLICY "Users can view their own or unclaimed projects"
ON public.projects
FOR SELECT
TO public
USING (
  auth.uid() = user_id OR user_id IS NULL
);

-- Allow users to update unclaimed projects to claim them
CREATE POLICY "Users can claim unclaimed projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (user_id IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own claimed projects
CREATE POLICY "Users can update their claimed projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete their claimed projects"
ON public.projects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update phase_outputs to allow public insert for unclaimed projects
DROP POLICY IF EXISTS "Users can create phase outputs for their projects" ON public.phase_outputs;

CREATE POLICY "Anyone can create phase outputs for unclaimed projects"
ON public.phase_outputs
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id
    AND (user_id IS NULL OR user_id = auth.uid())
  )
);

-- Update experiments to allow public insert for unclaimed projects
DROP POLICY IF EXISTS "Users can create experiments for their projects" ON public.experiments;

CREATE POLICY "Anyone can create experiments for unclaimed projects"
ON public.experiments
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id
    AND (user_id IS NULL OR user_id = auth.uid())
  )
);