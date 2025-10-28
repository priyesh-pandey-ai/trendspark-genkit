-- Update content_kits status constraint to support all statuses
ALTER TABLE public.content_kits 
DROP CONSTRAINT IF EXISTS content_kits_status_check;

ALTER TABLE public.content_kits 
ADD CONSTRAINT content_kits_status_check 
CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'exported'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_content_kits_created_at ON public.content_kits(created_at);
CREATE INDEX IF NOT EXISTS idx_content_kits_status ON public.content_kits(status);
CREATE INDEX IF NOT EXISTS idx_content_kits_platform ON public.content_kits(platform);
