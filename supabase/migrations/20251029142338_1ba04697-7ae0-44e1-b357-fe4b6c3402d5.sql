-- Create trends table for storing discovered trending topics
CREATE TABLE IF NOT EXISTS public.trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL CHECK (source IN ('reddit', 'twitter', 'google_trends', 'manual')),
  category TEXT,
  growth_rate NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  trending_since TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on trends
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;

-- Trends are viewable by all authenticated users
CREATE POLICY "Trends viewable by authenticated users"
  ON public.trends FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can manage trends (via edge functions)
CREATE POLICY "Service role can manage trends"
  ON public.trends FOR ALL
  TO service_role
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trends_category ON public.trends(category);
CREATE INDEX IF NOT EXISTS idx_trends_created_at ON public.trends(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trends_growth_rate ON public.trends(growth_rate DESC);
CREATE INDEX IF NOT EXISTS idx_trends_source ON public.trends(source);

-- Add trigger for updated_at
CREATE TRIGGER update_trends_updated_at 
  BEFORE UPDATE ON public.trends
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();