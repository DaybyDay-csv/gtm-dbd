-- Drop all existing UPDATE policies first
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can claim projects with valid session" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their claimed projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update unclaimed projects with session token" ON public.projects;
DROP POLICY IF EXISTS "Users can claim their session projects" ON public.projects;

-- Policy for viewing projects
CREATE POLICY "Users can view their own projects or session projects"
ON public.projects
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR (user_id IS NULL AND session_token IS NOT NULL)
);

-- Single comprehensive UPDATE policy
CREATE POLICY "Update projects with session token or ownership"
ON public.projects
FOR UPDATE
USING (
  (user_id IS NULL AND session_token IS NOT NULL) OR 
  (auth.uid() = user_id)
)
WITH CHECK (
  (user_id IS NULL AND session_token IS NOT NULL) OR 
  (auth.uid() = user_id)
);