-- Remove public RLS policies from rate_limits table
-- Only service role (used by edge functions) should access this table

DROP POLICY IF EXISTS "Anyone can read rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can insert rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can update rate limits" ON public.rate_limits;

-- RLS stays enabled, but with no permissive policies, 
-- only service role can access the table