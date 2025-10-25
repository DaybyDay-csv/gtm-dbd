-- Migration: Update experiments table for Phase 7 creative variations
-- Add new columns for enhanced experiment tracking

ALTER TABLE experiments 
ADD COLUMN IF NOT EXISTS disc_profile text,
ADD COLUMN IF NOT EXISTS objective text,
ADD COLUMN IF NOT EXISTS emotional_trigger text,
ADD COLUMN IF NOT EXISTS buyer_field text,
ADD COLUMN IF NOT EXISTS offer text,
ADD COLUMN IF NOT EXISTS visual_suggestion text,
ADD COLUMN IF NOT EXISTS reasoning text,
ADD COLUMN IF NOT EXISTS subheadline text;

-- Rename hypothesis to effect for clarity (effect = what we want to achieve)
DO $$ 
BEGIN
  IF EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='experiments' AND column_name='hypothesis'
  ) THEN
    ALTER TABLE experiments RENAME COLUMN hypothesis TO effect;
  END IF;
END $$;

-- Add comment explaining the effect/objective relationship
COMMENT ON COLUMN experiments.effect IS 'What we want to validate (the EFFECT we desire)';
COMMENT ON COLUMN experiments.objective IS 'Why we are testing this (the strategic CAUSE)';

-- Create index for filtering by DISC profile and channel
CREATE INDEX IF NOT EXISTS idx_experiments_disc_profile ON experiments(disc_profile);
CREATE INDEX IF NOT EXISTS idx_experiments_channel ON experiments(channel);
CREATE INDEX IF NOT EXISTS idx_experiments_project_channel ON experiments(project_id, channel);