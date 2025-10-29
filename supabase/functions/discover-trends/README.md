# Trend Discovery System

This edge function discovers trending topics from multiple sources (Reddit, Twitter, Google Trends) and stores them in the database for content generation.

## Features

- **Multi-source trend aggregation**: Fetches trends from Reddit, Twitter/X, and Google Trends
- **Automatic deduplication**: Removes duplicate trends based on topic similarity
- **Engagement scoring**: Calculates engagement scores based on social metrics
- **Category classification**: Automatically categorizes trends
- **Rate limiting**: Handles API rate limits gracefully

## Setup

### Required Environment Variables

Set these in your Supabase project settings under Edge Functions:

```bash
# Required (automatically available in Supabase)
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - Twitter/X API (for Twitter trends)
TWITTER_BEARER_TOKEN=your-twitter-bearer-token

# Optional - Serper API (for Google Trends proxy)
SERPER_API_KEY=your-serper-api-key
```

### API Key Setup

#### Reddit API
- No API key required for basic trending posts
- Uses public JSON endpoints with proper User-Agent header
- Rate limited to ~60 requests per minute

#### Twitter API (Optional)
1. Create a Twitter Developer account at https://developer.twitter.com
2. Create a new app and generate Bearer Token
3. Add `TWITTER_BEARER_TOKEN` to Supabase Edge Function secrets

#### Serper API for Google Trends (Optional)
1. Sign up at https://serper.dev
2. Get your API key from the dashboard
3. Add `SERPER_API_KEY` to Supabase Edge Function secrets

## Deployment

Deploy the function to Supabase:

```bash
supabase functions deploy discover-trends
```

## Usage

### Manual Trigger

Call the edge function manually via HTTP:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/discover-trends' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

Or from your application:

```typescript
const { data, error } = await supabase.functions.invoke('discover-trends');
```

### Scheduled Execution

#### Option 1: GitHub Actions (Recommended for Free Tier)

Create `.github/workflows/discover-trends.yml`:

```yaml
name: Discover Trends
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch: # Allow manual trigger

jobs:
  discover-trends:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Trend Discovery
        run: |
          curl -X POST '${{ secrets.SUPABASE_URL }}/functions/v1/discover-trends' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}'
```

#### Option 2: Supabase Pro with pg_cron

If you have Supabase Pro, enable pg_cron in your dashboard and run:

```sql
SELECT cron.schedule(
  'discover-trends-daily',
  '0 */6 * * *', -- Every 6 hours
  $$SELECT invoke_discover_trends()$$
);
```

#### Option 3: External Cron Service

Use services like:
- Cron-job.org
- EasyCron
- AWS EventBridge

## Response Format

Success response:

```json
{
  "success": true,
  "trendsDiscovered": 45,
  "sources": {
    "reddit": 30,
    "twitter": 10,
    "google": 5
  }
}
```

Error response:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Testing

Test the function locally:

```bash
supabase functions serve discover-trends
```

Then call it:

```bash
curl -X POST 'http://localhost:54321/functions/v1/discover-trends' \
  -H 'Authorization: Bearer eyJhbGc...'
```

## Monitoring

Check function logs:

```bash
supabase functions logs discover-trends
```

Or view logs in Supabase Dashboard under Edge Functions.

## Rate Limits

- **Reddit**: ~60 requests/minute per IP
- **Twitter**: Varies by plan (Basic tier: 10,000 tweets/month)
- **Serper**: 2,500 searches/month on free tier

## Troubleshooting

### No trends being discovered

1. Check if Reddit API is accessible from your region
2. Verify environment variables are set correctly
3. Check function logs for errors

### Rate limit errors

- Reduce frequency of scheduled runs
- Implement exponential backoff (already included)
- Consider upgrading API plans

### Database errors

- Ensure trends table exists (run migration 20251029142338)
- Check RLS policies allow service role access
- Verify service role key is correct

## Architecture

```
┌─────────────────────┐
│  Scheduled Trigger  │
│  (GitHub Actions/   │
│   pg_cron/Manual)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Edge Function:     │
│  discover-trends    │
├─────────────────────┤
│ - Fetch Reddit      │
│ - Fetch Twitter     │
│ - Fetch Google      │
│ - Deduplicate       │
│ - Score & Sort      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Supabase Database  │
│  trends table       │
└─────────────────────┘
```
