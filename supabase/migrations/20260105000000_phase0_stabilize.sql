-- Phase 0 Stabilize Migration
-- Fixes: phase_outputs CHECK constraint (allow phase 7), adds email_leads, admin_users, wires is_valid_session_token, schedules pg_cron cleanup

-- 1. Fix the phase 7 block: allow phases 1..7
ALTER TABLE public.phase_outputs DROP CONSTRAINT IF EXISTS phase_outputs_phase_check;
ALTER TABLE public.phase_outputs ADD CONSTRAINT phase_outputs_phase_check
  CHECK (phase BETWEEN 1 AND 7);

-- 2. Frictionless email-lead capture table (no auth required)
CREATE TABLE IF NOT EXISTS public.email_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('pdf_download','phase_5_email_only','hero','other')),
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es','en')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_leads_email ON public.email_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_leads_project ON public.email_leads(project_id);
CREATE INDEX IF NOT EXISTS idx_email_leads_created ON public.email_leads(created_at DESC);

ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit email lead" ON public.email_leads;
CREATE POLICY "Anyone can submit email lead"
  ON public.email_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read email leads" ON public.email_leads;
CREATE POLICY "Admins can read email leads"
  ON public.email_leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.uid()::text)
  );

-- 3. Wire is_valid_session_token into the projects RLS
-- This ensures unclaimed-project sessions actually expire server-side
DROP POLICY IF EXISTS "Users can view their own projects or session projects" ON public.projects;
CREATE POLICY "Users can view their own projects or session projects"
  ON public.projects FOR SELECT
  TO public
  USING (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND session_token IS NOT NULL AND public.is_valid_session_token(session_token))
  );

-- 4. Admin users table (for the admin dashboard in Phase 1; schema-first in Phase 0)
CREATE TABLE IF NOT EXISTS public.admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
CREATE POLICY "Admins can read admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (email = auth.uid()::text);

-- INSERT/UPDATE/DELETE: blocked from anon/authenticated (only service_role can mutate)
INSERT INTO public.admin_users (email) VALUES ('contact@daybydayconsulting.com')
  ON CONFLICT DO NOTHING;

-- 5. Schedule cleanup_security_tables hourly via pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('cleanup-security-tables');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    PERFORM cron.schedule(
      'cleanup-security-tables',
      '0 * * * *',
      $cron$SELECT public.cleanup_security_tables();$cron$
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available: %. cleanup_security_tables must be called manually or via a different scheduler.', SQLERRM;
  END;
END
$$;
