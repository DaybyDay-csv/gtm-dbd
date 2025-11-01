-- Create anonymous sessions table for proper session token management
CREATE TABLE IF NOT EXISTS public.anonymous_sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  ip_address TEXT,
  revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Enable RLS on anonymous_sessions
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read their own session (by token)
CREATE POLICY "Anyone can read their own session"
ON public.anonymous_sessions
FOR SELECT
USING (true);

-- Allow anyone to create sessions
CREATE POLICY "Anyone can create sessions"
ON public.anonymous_sessions
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_token ON public.anonymous_sessions(token);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_expires_at ON public.anonymous_sessions(expires_at) WHERE NOT revoked;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_limit_key TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rate_limit_key, endpoint, window_start)
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rate limits (needed for checking)
CREATE POLICY "Anyone can read rate limits"
ON public.rate_limits
FOR SELECT
USING (true);

-- Allow anyone to insert/update rate limits
CREATE POLICY "Anyone can insert rate limits"
ON public.rate_limits
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update rate limits"
ON public.rate_limits
FOR UPDATE
USING (true);

-- Create index for faster rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_endpoint ON public.rate_limits(rate_limit_key, endpoint, window_start);

-- Function to validate session tokens
CREATE OR REPLACE FUNCTION public.is_valid_session_token(token TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.anonymous_sessions
    WHERE token = $1
    AND expires_at > NOW()
    AND NOT revoked
  );
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  key TEXT,
  endpoint TEXT,
  max_requests INTEGER,
  window_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window TIMESTAMPTZ;
  current_count INTEGER;
  result JSONB;
BEGIN
  -- Calculate current window start (round down to window_minutes)
  current_window := DATE_TRUNC('hour', NOW()) + 
    (FLOOR(EXTRACT(MINUTE FROM NOW()) / window_minutes) * window_minutes || ' minutes')::INTERVAL;
  
  -- Try to get existing record
  SELECT request_count INTO current_count
  FROM public.rate_limits
  WHERE rate_limit_key = key
    AND endpoint = endpoint
    AND window_start = current_window
  FOR UPDATE;
  
  -- If record exists, check if limit exceeded
  IF FOUND THEN
    IF current_count >= max_requests THEN
      -- Rate limit exceeded
      result := jsonb_build_object(
        'allowed', false,
        'current_count', current_count,
        'limit', max_requests,
        'retry_after', EXTRACT(EPOCH FROM (current_window + (window_minutes || ' minutes')::INTERVAL - NOW()))
      );
    ELSE
      -- Increment counter
      UPDATE public.rate_limits
      SET request_count = request_count + 1
      WHERE rate_limit_key = key
        AND endpoint = endpoint
        AND window_start = current_window;
      
      result := jsonb_build_object(
        'allowed', true,
        'current_count', current_count + 1,
        'limit', max_requests,
        'remaining', max_requests - current_count - 1
      );
    END IF;
  ELSE
    -- Create new record
    INSERT INTO public.rate_limits (rate_limit_key, endpoint, request_count, window_start)
    VALUES (key, endpoint, 1, current_window)
    ON CONFLICT (rate_limit_key, endpoint, window_start) 
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    
    result := jsonb_build_object(
      'allowed', true,
      'current_count', 1,
      'limit', max_requests,
      'remaining', max_requests - 1
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Update can_access_project to validate session tokens
CREATE OR REPLACE FUNCTION public.can_access_project(project_uuid uuid, session_tok text)
RETURNS boolean
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE id = project_uuid
    AND (
      user_id = auth.uid()
      OR (
        user_id IS NULL 
        AND session_token = session_tok
        AND (session_tok IS NULL OR public.is_valid_session_token(session_tok))
      )
    )
  );
$$;

-- Function to cleanup expired sessions and old rate limits (call periodically)
CREATE OR REPLACE FUNCTION public.cleanup_security_tables()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  -- Delete expired sessions older than 7 days
  DELETE FROM public.anonymous_sessions
  WHERE expires_at < NOW() - INTERVAL '7 days';
  
  -- Delete old rate limit records older than 24 hours
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
$$;