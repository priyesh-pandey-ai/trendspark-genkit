# Deployment Guide for Trend Discovery System

This guide walks you through deploying and configuring the Trend Discovery System.

## Prerequisites

- Supabase account and project
- Supabase CLI installed: `npm install -g supabase`
- Git and GitHub account (for automated scheduling)

## Step 1: Deploy Database Migrations

Run the migrations to set up the trends table and helper functions:

```bash
# Make sure you're logged in to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or manually run the migrations in Supabase SQL Editor:
1. Open Supabase Dashboard → SQL Editor
2. Run migration `20251029142338_1ba04697-7ae0-44e1-b357-fe4b6c3402d5.sql`
3. Run migration `20251029143900_add_trend_discovery_scheduler.sql`

## Step 2: Deploy Edge Function

Deploy the discover-trends edge function:

```bash
# From the project root
supabase functions deploy discover-trends
```

## Step 3: Configure Environment Variables

### Required (Auto-configured by Supabase)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

### Optional API Keys

Add these in Supabase Dashboard → Edge Functions → discover-trends → Settings:

#### For Twitter/X Trends (Optional)
```bash
TWITTER_BEARER_TOKEN=your-bearer-token-here
```

How to get:
1. Sign up at https://developer.twitter.com
2. Create a new app in the Developer Portal
3. Generate a Bearer Token
4. Note: Free tier has limited requests

#### For Google Trends via Serper (Optional)
```bash
SERPER_API_KEY=your-serper-api-key
```

How to get:
1. Sign up at https://serper.dev
2. Get API key from dashboard
3. Free tier: 2,500 searches/month

**Note:** Reddit trends work without API keys using public endpoints.

## Step 4: Configure GitHub Actions (Recommended)

Set up automated trend discovery:

### 4.1 Add GitHub Secrets

Go to your repo → Settings → Secrets and variables → Actions → New repository secret:

1. `SUPABASE_URL`: Your Supabase project URL (from .env file)
2. `SUPABASE_ANON_KEY`: Your Supabase anon/public key (from .env file)

### 4.2 Enable GitHub Actions

The workflow file `.github/workflows/discover-trends.yml` is already in place.

To enable:
1. Go to your repo → Actions tab
2. Enable workflows if prompted
3. The workflow will run automatically every 6 hours
4. You can also trigger it manually from the Actions tab

### 4.3 Adjust Schedule (Optional)

Edit `.github/workflows/discover-trends.yml` to change frequency:

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours (default)
    # - cron: '0 */12 * * *'  # Every 12 hours
    # - cron: '0 0 * * *'  # Once daily at midnight
```

## Step 5: Alternative Scheduling Options

### Option A: Manual Trigger

Call from your application:
```typescript
const { data, error } = await supabase.functions.invoke('discover-trends');
```

### Option B: External Cron Service

Use services like:
- Cron-job.org (free, easy setup)
- EasyCron
- AWS EventBridge

Configure to POST to: `https://your-project.supabase.co/functions/v1/discover-trends`

### Option C: Supabase Pro with pg_cron

If you have Supabase Pro:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule trend discovery every 6 hours
SELECT cron.schedule(
  'discover-trends-6h',
  '0 */6 * * *',
  $$SELECT invoke_discover_trends()$$
);
```

Note: This requires implementing the pg_net call in the `invoke_discover_trends()` function.

## Step 6: Verify Deployment

### Test the Edge Function

Using the provided test script:
```bash
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-anon-key"
./supabase/functions/discover-trends/test.sh
```

Or manually with curl:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/discover-trends' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Check the Logs

View execution logs:
```bash
supabase functions logs discover-trends --tail
```

Or in Supabase Dashboard → Edge Functions → discover-trends → Logs

### Verify in the App

1. Navigate to `/discover-trends` in your app
2. Click "Discover New Trends" button
3. Verify new trends appear in the list
4. Check that trends are categorized correctly

## Step 7: Monitor and Maintain

### Check GitHub Actions Status

- Go to repo → Actions → Discover Trends
- View run history and logs
- Set up notifications for failed runs

### Monitor Database

Check trends table regularly:
```sql
-- Count total trends
SELECT COUNT(*) FROM trends;

-- View latest trends
SELECT topic, source, category, created_at 
FROM trends 
ORDER BY created_at DESC 
LIMIT 10;

-- Check trends by source
SELECT source, COUNT(*) as count 
FROM trends 
GROUP BY source;
```

### Rate Limit Considerations

- **Reddit**: ~60 requests/min (free, no API key needed)
- **Twitter**: Varies by plan (Basic: 10,000 tweets/month)
- **Serper**: 2,500 searches/month on free tier

Adjust GitHub Action schedule if hitting rate limits.

## Troubleshooting

### Edge Function Not Working

1. Check Edge Function logs in Supabase Dashboard
2. Verify environment variables are set
3. Check if Reddit is accessible from your region
4. Try deploying again: `supabase functions deploy discover-trends`

### GitHub Actions Failing

1. Verify secrets are set correctly in GitHub
2. Check Actions logs for specific errors
3. Test edge function manually first
4. Ensure Supabase project is not paused

### No Trends Appearing

1. Run edge function manually to test
2. Check database: `SELECT * FROM trends LIMIT 10;`
3. Verify RLS policies allow reading trends
4. Check frontend console for errors

### Rate Limit Errors

1. Reduce GitHub Action frequency
2. Consider adding paid API tiers
3. Implement longer delays between API calls

## Cost Estimates

### Free Tier
- Reddit API: Free (no key required)
- GitHub Actions: 2,000 minutes/month free
- Supabase: Free tier includes edge functions
- **Total**: $0/month

### With Optional APIs
- Twitter API Basic: $100/month
- Serper API: Free tier sufficient (2,500 searches/month)
- **Total**: ~$100/month (if you need Twitter)

### Recommended Setup for Most Users
- Use Reddit trends (free)
- Skip Twitter API initially
- Use Serper free tier for Google Trends
- GitHub Actions for scheduling (free)
- **Total**: $0/month

## Next Steps

1. Monitor the first few automated runs
2. Adjust API configurations based on your needs
3. Consider adding more trend sources
4. Customize trend categorization logic
5. Set up alerts for failed runs

## Support

For issues:
1. Check Supabase Edge Function logs
2. Review GitHub Actions run logs
3. Consult the README in `supabase/functions/discover-trends/`
4. Check Supabase documentation: https://supabase.com/docs
