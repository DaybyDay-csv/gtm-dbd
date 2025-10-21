-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create phase_outputs table to store results from each phase
CREATE TABLE public.phase_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  phase INTEGER NOT NULL CHECK (phase >= 1 AND phase <= 6),
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, phase)
);

-- Enable RLS
ALTER TABLE public.phase_outputs ENABLE ROW LEVEL SECURITY;

-- Create policies for phase_outputs
CREATE POLICY "Users can view outputs for their projects"
  ON public.phase_outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = phase_outputs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create outputs for their projects"
  ON public.phase_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = phase_outputs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update outputs for their projects"
  ON public.phase_outputs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = phase_outputs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create experiments table for validation phase
CREATE TABLE public.experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  hypothesis TEXT NOT NULL,
  channel TEXT NOT NULL,
  headline TEXT NOT NULL,
  cta TEXT NOT NULL,
  kpi TEXT NOT NULL,
  cost TEXT,
  ttv TEXT,
  state TEXT DEFAULT 'Discover' CHECK (state IN ('Discover', 'Test', 'Scale')),
  owner TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- Create policies for experiments
CREATE POLICY "Users can view experiments for their projects"
  ON public.experiments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = experiments.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create experiments for their projects"
  ON public.experiments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = experiments.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update experiments for their projects"
  ON public.experiments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = experiments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();