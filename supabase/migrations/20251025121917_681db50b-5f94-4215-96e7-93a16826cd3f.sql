-- Add missing DELETE policy for phase_outputs table
CREATE POLICY "Users can delete phase outputs for their projects"
ON public.phase_outputs
FOR DELETE
TO authenticated
USING (public.owns_project(project_id));