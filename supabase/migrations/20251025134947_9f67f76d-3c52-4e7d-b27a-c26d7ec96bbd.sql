-- Add more descriptive fields to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS key_insights TEXT;

-- Update the name column to be more flexible (can be auto-generated)
COMMENT ON COLUMN public.projects.company_name IS 'Name of the company being analyzed';
COMMENT ON COLUMN public.projects.product_name IS 'Name of the product/service';
COMMENT ON COLUMN public.projects.key_insights IS 'Key conclusions and insights from the analysis';