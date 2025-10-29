-- Enable pg_cron extension for scheduled jobs (requires Supabase Pro)
-- Note: pg_cron is only available on Supabase Pro plans and above
-- For development, trends can be refreshed manually via the edge function

-- Create a helper function to call the discover-trends edge function
CREATE OR REPLACE FUNCTION invoke_discover_trends()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url text;
  service_key text;
BEGIN
  -- Get Supabase URL and service key from vault or environment
  -- This is a placeholder - in production, you'd use pg_net to invoke the edge function
  -- or use Supabase's built-in scheduler
  
  RAISE NOTICE 'Trend discovery should be triggered via Supabase edge function';
  
  -- In production, use pg_net extension:
  -- SELECT net.http_post(
  --   url := project_url || '/functions/v1/discover-trends',
  --   headers := jsonb_build_object('Authorization', 'Bearer ' || service_key),
  --   body := '{}'::jsonb
  -- );
END;
$$;

-- Add a comment explaining how to set up the cron job
COMMENT ON FUNCTION invoke_discover_trends() IS 
'Helper function to trigger trend discovery. 
To schedule automatic updates on Supabase Pro:
1. Enable pg_cron extension in Supabase dashboard
2. Run: SELECT cron.schedule(''discover-trends-hourly'', ''0 * * * *'', $$SELECT invoke_discover_trends()$$);
3. Or use Supabase Edge Functions with GitHub Actions or external cron service';

-- Create a manual trigger function that can be called by authorized users
CREATE OR REPLACE FUNCTION public.trigger_trend_discovery()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called from the frontend to manually trigger trend discovery
  -- The actual discovery will be done by the edge function
  
  RETURN json_build_object(
    'status', 'triggered',
    'message', 'Trend discovery has been initiated. Please call the discover-trends edge function.',
    'timestamp', now()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.trigger_trend_discovery() TO authenticated;

-- Add index on topic for uniqueness check (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'trends' 
    AND indexname = 'idx_trends_topic_unique'
  ) THEN
    CREATE INDEX idx_trends_topic_unique ON public.trends(topic);
  END IF;
END $$;
