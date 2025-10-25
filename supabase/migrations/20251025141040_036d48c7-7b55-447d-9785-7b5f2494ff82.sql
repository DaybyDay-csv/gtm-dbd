-- Allow multiple projects with the same name per user
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_name_key;

-- Ensure updated_at updates automatically on any change
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();