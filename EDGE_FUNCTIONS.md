# Edge Functions Documentation

## Overview

This project uses three Supabase Edge Functions powered by Google Gemini API for AI-driven content generation and trend discovery.

---

## 1. generate-voice-card

### Purpose
Analyzes sample brand posts to generate a comprehensive Brand Voice Card with tone, style, and content guidelines.

### Endpoint
`POST /functions/v1/generate-voice-card`

### Input Parameters
```json
{
  "samplePosts": ["Post 1", "Post 2", ...],
  "niche": "Your brand niche (e.g., D2C Coffee Roaster)"
}
```

### Output
```json
{
  "voiceCard": "Markdown-formatted brand voice guidelines with sections for ethos, tone, vocabulary, CTAs, etc."
}
```

### Features
- ✅ Analyzes multiple sample posts
- ✅ Generates comprehensive voice guidelines
- ✅ Includes tone descriptors, vocabulary preferences, CTA patterns
- ✅ Safety filter checks
- ✅ Response validation

### Error Handling
- Validates AI response exists
- Checks for content blocks by safety filters
- Validates minimum content length
- Provides detailed error messages

---

## 2. generate-content-kit

### Purpose
Creates platform-optimized social media posts based on trending topics and brand voice guidelines.

### Endpoint
`POST /functions/v1/generate-content-kit`

### Input Parameters
```json
{
  "voiceCard": "Brand voice guidelines (from generate-voice-card)",
  "trendTitle": "The trending topic to create content about",
  "platforms": ["Instagram", "LinkedIn", "Twitter"],
  "niche": "Your brand niche"
}
```

### Output
```json
{
  "contentKits": [
    {
      "platform": "Instagram",
      "hook": "Attention-grabbing hook (≤80 chars)",
      "body": "Engaging post content (≤220 words)",
      "cta": "Clear call-to-action",
      "hashtags": ["#hashtag1", "#hashtag2", ...]
    },
    ...
  ]
}
```

### Features
- ✅ Multi-platform content generation
- ✅ Platform-specific optimization
- ✅ Voice-consistent content
- ✅ JSON extraction from markdown
- ✅ Robust parsing with fallbacks
- ✅ Content validation

### Error Handling
- Safety filter detection
- JSON parsing with multiple fallback strategies
- Array structure validation
- Detailed error reporting

---

## 3. discover-trends

### Purpose
Automatically discovers trending topics from Reddit, Twitter, and Google Trends, storing them in the database.

### Endpoint
`POST /functions/v1/discover-trends`

### Input Parameters
None (can be triggered manually or via scheduled job)

### Output
```json
{
  "success": true,
  "trendsDiscovered": 42,
  "sources": {
    "reddit": 25,
    "twitter": 0,
    "google": 17
  }
}
```

### Data Sources

#### Reddit
- Fetches from: technology, business, lifestyle, health, marketing subreddits
- Rate limiting: 500ms delay between requests
- Filters: Removes deleted/removed posts
- Metrics: Engagement score, growth rate

#### Twitter (Optional)
- Requires: `TWITTER_BEARER_TOKEN` secret
- Fetches: Global trending topics
- Status: Skipped if not configured

#### Google Trends (Optional)
- Requires: `SERPER_API_KEY` secret
- Fetches: Top trending search queries
- Status: Skipped if not configured

### Features
- ✅ Multi-source trend aggregation
- ✅ Deduplication logic
- ✅ Engagement scoring
- ✅ Category mapping
- ✅ Database upsert (updates existing trends)
- ✅ Per-subreddit error handling
- ✅ Rate limiting to avoid API blocks

### Error Handling
- Individual source failure doesn't stop others
- Per-subreddit try-catch blocks
- Detailed logging for each source
- Graceful degradation (returns partial results)

---

## Configuration

### Required Secrets

All Edge Functions require these secrets to be set in Supabase:

```bash
# Required for AI generation functions
npx supabase secrets set GEMINI_API_KEY=your_key_here

# Required for discover-trends (automatically set)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For Twitter trends
npx supabase secrets set TWITTER_BEARER_TOKEN=your_token

# Optional: For Google Trends via Serper
npx supabase secrets set SERPER_API_KEY=your_key
```

### Getting API Keys

#### Gemini API Key (Required)
1. Visit: https://ai.google.dev/
2. Click "Get API key"
3. Sign in with Google account
4. Create API key in new project
5. Copy and set the secret

**Free Tier:**
- 15 requests/minute
- 1,500 requests/day
- No credit card required

#### Serper API Key (Optional)
1. Visit: https://serper.dev/
2. Sign up for free account
3. Get API key from dashboard
4. Free tier: 2,500 searches/month

#### Twitter Bearer Token (Optional)
1. Apply for Twitter Developer account: https://developer.twitter.com/
2. Create an app
3. Get Bearer Token from app settings

---

## Deployment

Deploy all functions:
```bash
npx supabase functions deploy
```

Deploy specific function:
```bash
npx supabase functions deploy generate-voice-card
```

---

## Testing

### Test Voice Card Generation
```bash
node test-edge-function.js
```

### Test Content Kit Generation
Create a test file:
```javascript
// test-content-kit.js
const response = await fetch('https://your-project.supabase.co/functions/v1/generate-content-kit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    voiceCard: 'Your brand voice guidelines...',
    trendTitle: 'AI Revolution in Healthcare',
    platforms: ['Instagram', 'LinkedIn'],
    niche: 'Healthcare Technology'
  })
});
```

### Test Trend Discovery
```bash
# Trigger manually
curl -X POST https://your-project.supabase.co/functions/v1/discover-trends \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Rate Limits & Best Practices

### Gemini API
- **Limit:** 15 requests/minute
- **Best Practice:** Implement retry logic with exponential backoff
- **Cost:** Free within limits

### Reddit API
- **Limit:** ~60 requests/minute (unofficial)
- **Best Practice:** Use 500ms delay between requests
- **User-Agent:** Always include a descriptive User-Agent

### General
- Cache responses when possible
- Implement request queuing for high traffic
- Monitor function invocations in Supabase dashboard
- Set up error alerts for production

---

## Common Issues & Solutions

### Issue: "Edge Function returned a non-2xx status code"
**Solution:** Check function logs: `npx supabase functions logs FUNCTION_NAME --limit 10`

### Issue: "GEMINI_API_KEY is not configured"
**Solution:** Set the secret: `npx supabase secrets set GEMINI_API_KEY=your_key`

### Issue: "Failed to parse AI response as JSON"
**Solution:** The improved error handling now includes multiple fallback strategies. If persistent, check the prompt formatting.

### Issue: "Rate limit exceeded"
**Solution:** 
- Wait before retrying
- Upgrade Gemini API tier (if needed)
- Implement request queuing

### Issue: Reddit trends not showing
**Solution:**
- Check Reddit isn't blocking requests
- Verify User-Agent is set
- Check for rate limiting (500ms delay added)

---

## Monitoring

Check function status:
```bash
npx supabase functions list
```

View logs:
```bash
npx supabase functions logs generate-voice-card --limit 20
npx supabase functions logs generate-content-kit --limit 20
npx supabase functions logs discover-trends --limit 20
```

Dashboard:
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions

---

## Performance

### Typical Response Times
- **generate-voice-card:** 3-8 seconds
- **generate-content-kit:** 4-10 seconds (varies by # of platforms)
- **discover-trends:** 15-45 seconds (depends on # of sources)

### Optimization Tips
1. Cache brand voice cards in database
2. Generate content kits asynchronously
3. Schedule trend discovery during off-peak hours
4. Use lower temperature (0.5-0.7) for faster responses

---

## Security

### Best Practices
- ✅ Never expose API keys in client code
- ✅ Use environment secrets for all credentials
- ✅ Validate input on Edge Functions
- ✅ Implement rate limiting on client side
- ✅ Use RLS (Row Level Security) on database tables
- ✅ Monitor function invocations for abuse

### CORS Headers
All functions include proper CORS headers for web app access:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## Changelog

### v2.0.0 (Current)
- ✅ Migrated from Lovable AI Gateway to Google Gemini API
- ✅ Updated model to gemini-2.5-flash
- ✅ Added comprehensive error handling
- ✅ Added response validation
- ✅ Added JSON parsing fallbacks
- ✅ Improved Reddit API reliability
- ✅ Added per-source error handling in discover-trends

### v1.0.0 (Legacy)
- Used Lovable AI Gateway
- Basic error handling
- Single-source trend discovery
