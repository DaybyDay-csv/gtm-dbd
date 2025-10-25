-- Step 1: Make user_id NOT NULL in projects table (after we add auth, all new projects will have user_id)
-- For existing data, we'll set a placeholder that will be cleaned up once users claim their projects
ALTER TABLE public.projects 
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Step 2: Drop all existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can create projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;

DROP POLICY IF EXISTS "Anyone can view phase outputs" ON public.phase_outputs;
DROP POLICY IF EXISTS "Anyone can create phase outputs" ON public.phase_outputs;
DROP POLICY IF EXISTS "Anyone can update phase outputs" ON public.phase_outputs;

DROP POLICY IF EXISTS "Anyone can view experiments" ON public.experiments;
DROP POLICY IF EXISTS "Anyone can create experiments" ON public.experiments;
DROP POLICY IF EXISTS "Anyone can update experiments" ON public.experiments;

-- Step 3: Create security definer function to check project ownership
-- This prevents RLS recursion when checking related tables
CREATE OR REPLACE FUNCTION public.owns_project(project_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE id = project_uuid
      AND user_id = auth.uid()
  );
$$;

-- Step 4: Create owner-based RLS policies for projects table
CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Create owner-based RLS policies for phase_outputs table
-- Users can only access phase outputs for projects they own
CREATE POLICY "Users can view phase outputs for their projects"
ON public.phase_outputs
FOR SELECT
TO authenticated
USING (public.owns_project(project_id));

CREATE POLICY "Users can create phase outputs for their projects"
ON public.phase_outputs
FOR INSERT
TO authenticated
WITH CHECK (public.owns_project(project_id));

CREATE POLICY "Users can update phase outputs for their projects"
ON public.phase_outputs
FOR UPDATE
TO authenticated
USING (public.owns_project(project_id));

-- Step 6: Create owner-based RLS policies for experiments table
CREATE POLICY "Users can view experiments for their projects"
ON public.experiments
FOR SELECT
TO authenticated
USING (public.owns_project(project_id));

CREATE POLICY "Users can create experiments for their projects"
ON public.experiments
FOR INSERT
TO authenticated
WITH CHECK (public.owns_project(project_id));

CREATE POLICY "Users can update experiments for their projects"
ON public.experiments
FOR UPDATE
TO authenticated
USING (public.owns_project(project_id));

CREATE POLICY "Users can delete experiments for their projects"
ON public.experiments
FOR DELETE
TO authenticated
USING (public.owns_project(project_id));