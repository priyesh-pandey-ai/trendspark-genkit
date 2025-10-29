# Trend Discovery System - Quick Reference

## 🚀 Quick Start

### Deploy Everything
```bash
# 1. Deploy migrations
supabase db push

# 2. Deploy edge function
supabase functions deploy discover-trends

# 3. Add GitHub secrets (SUPABASE_URL, SUPABASE_ANON_KEY)

# 4. Test manually
export SUPABASE_URL="your-url"
export SUPABASE_ANON_KEY="your-key"
./supabase/functions/discover-trends/test.sh
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `supabase/functions/discover-trends/index.ts` | Edge function that fetches trends |
| `supabase/functions/discover-trends/README.md` | Detailed documentation |
| `supabase/functions/discover-trends/test.sh` | Manual testing script |
| `supabase/migrations/20251029142338_*.sql` | Trends table schema |
| `supabase/migrations/20251029143900_*.sql` | Scheduler setup |
| `.github/workflows/discover-trends.yml` | Automated scheduling |
| `src/lib/trendDiscovery.ts` | Frontend utility functions |
| `src/pages/DiscoverTrends.tsx` | UI for viewing trends |
| `DEPLOYMENT.md` | Complete deployment guide |

## 🔧 Key Functions

### Edge Function (`supabase/functions/discover-trends/index.ts`)
```typescript
// Fetches trends from:
- fetchRedditTrends()    // Public API, no key needed
- fetchTwitterTrends()   // Requires TWITTER_BEARER_TOKEN
- fetchGoogleTrends()    // Requires SERPER_API_KEY
- deduplicateTrends()    // Remove duplicates
```

### Frontend Utils (`src/lib/trendDiscovery.ts`)
```typescript
// Trigger manual discovery
await triggerTrendDiscovery()

// Fetch trends with filters
await fetchLatestTrends({ category: 'Technology', limit: 50 })
```

## 🔑 Environment Variables

### Required (Auto-set by Supabase)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optional (Set in Supabase Edge Function settings)
- `TWITTER_BEARER_TOKEN` - Enable Twitter trends
- `SERPER_API_KEY` - Enable Google Trends

### GitHub Secrets (For automation)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📊 Database Schema

```sql
CREATE TABLE trends (
  id UUID PRIMARY KEY,
  topic TEXT NOT NULL,
  description TEXT,
  source TEXT CHECK (source IN ('reddit', 'twitter', 'google_trends', 'manual')),
  category TEXT,
  growth_rate NUMERIC DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  trending_since TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## ⚡ API Endpoints

### Trigger Discovery
```bash
POST /functions/v1/discover-trends
Authorization: Bearer YOUR_ANON_KEY
```

### Response
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

## 🕐 Scheduling

### GitHub Actions (Default)
- Runs every 6 hours automatically
- Manual trigger available in Actions tab
- Edit `.github/workflows/discover-trends.yml` to change schedule

### Alternative: pg_cron (Supabase Pro)
```sql
SELECT cron.schedule(
  'discover-trends-6h',
  '0 */6 * * *',
  $$SELECT invoke_discover_trends()$$
);
```

## 🧪 Testing

### Manual Test
```bash
./supabase/functions/discover-trends/test.sh
```

### Test in App
1. Go to `/discover-trends`
2. Click "Discover New Trends"
3. Check console for logs
4. Verify trends appear

### Check Logs
```bash
supabase functions logs discover-trends --tail
```

## 🐛 Common Issues

### "Edge function not found"
```bash
supabase functions deploy discover-trends
```

### "No trends discovered"
- Check Reddit is accessible (some regions block it)
- Verify edge function logs
- Try with optional API keys

### GitHub Actions failing
- Verify secrets in repo settings
- Check Actions logs for details
- Test edge function manually first

## 📈 Monitoring

### Check Trends Count
```sql
SELECT COUNT(*) FROM trends;
```

### View Latest Trends
```sql
SELECT topic, source, created_at 
FROM trends 
ORDER BY created_at DESC 
LIMIT 10;
```

### Trends by Source
```sql
SELECT source, COUNT(*) 
FROM trends 
GROUP BY source;
```

## 🔄 Update Process

1. Make changes to edge function
2. Deploy: `supabase functions deploy discover-trends`
3. Test: Run test script or manual trigger
4. Monitor: Check logs and database
5. Commit and push changes

## 📚 Documentation

- Full deployment guide: `DEPLOYMENT.md`
- Edge function docs: `supabase/functions/discover-trends/README.md`
- Supabase docs: https://supabase.com/docs

## 💡 Tips

- Start with Reddit only (no API keys needed)
- Add Twitter/Google APIs later if needed
- Monitor rate limits in first few runs
- Adjust GitHub Action schedule based on needs
- Use manual trigger for testing
