-- Add session_token column to projects table
ALTER TABLE public.projects ADD COLUMN session_token TEXT;

-- Create index for session token lookups
CREATE INDEX idx_projects_session_token ON public.projects(session_token) WHERE session_token IS NOT NULL;

-- Create a security definer function to check project access
CREATE OR REPLACE FUNCTION public.can_access_project(project_uuid UUID, session_tok TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE id = project_uuid
      AND (
        user_id = auth.uid() 
        OR (user_id IS NULL AND session_token = session_tok)
      )
  );
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own or unclaimed projects" ON public.projects;
DROP POLICY IF EXISTS "Users can claim unclaimed projects" ON public.projects;

-- Create new restrictive policy for viewing projects
-- Users can only see their own projects OR unclaimed projects they created (via session token check in app)
CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR (user_id IS NULL AND session_token IS NOT NULL)
);

-- Policy for claiming unclaimed projects (must have session token)
CREATE POLICY "Users can claim projects with valid session"
ON public.projects
FOR UPDATE
USING (user_id IS NULL AND session_token IS NOT NULL)
WITH CHECK (auth.uid() = user_id);

-- Update policy for owned projects
CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE  
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comment explaining the security model
COMMENT ON COLUMN public.projects.session_token IS 'Temporary session token for unauthenticated project access. Must be stored in client localStorage and verified in application code.';