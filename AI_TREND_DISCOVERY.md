# AI-Powered Trend Discovery with Gemini

## Overview

The trend discovery system now uses Google Gemini AI to analyze 100 top Reddit posts and extract **distinct trending topics** instead of just showing individual posts. This provides more meaningful, consolidated trends.

## How It Works

### 1. Data Collection (100 posts)
- Fetches 50 posts from r/all hot
- Fetches 40 posts from r/popular
- Fetches 10 rising posts
- Deduplicates and filters for quality

### 2. AI Analysis with Gemini
- Sends all post data to Gemini AI
- AI identifies patterns and groups similar posts
- Extracts 15 distinct trending topics
- Categorizes each trend appropriately
- Generates engaging titles and descriptions

### 3. Database Storage
- Saves distinct trends (not individual posts)
- Each trend represents multiple related Reddit posts
- Includes engagement metrics and growth rates

## Setup

### Get Your Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy your API key
4. Add to `.env.local`:

```bash
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Note**: Gemini API is free with generous limits:
- 15 requests per minute
- 1 million tokens per minute
- 1500 requests per day

Perfect for this use case!

## What Changed

### Before (Old System)
- Fetched 80 Reddit posts
- Directly converted each post to a trend
- Result: 25 individual post titles as "trends"
- No deduplication or grouping
- Similar topics appeared multiple times

### After (New AI System)
- Fetches 100 Reddit posts
- AI analyzes and groups similar posts
- Result: 15 distinct, meaningful trends
- Each trend represents a broader topic
- Better descriptions and categorization

## Example Output

### Old System (without AI):
```
1. "TIL that octopuses have three hearts"
2. "TIL octopuses can change color instantly"
3. "Amazing octopus facts you didn't know"
```
(3 separate "trends" about the same topic)

### New System (with AI):
```
1. Trend: "Marine Biology Discoveries Going Viral"
   Description: "Fascinating octopus abilities and ocean creature facts captivating social media, with emphasis on intelligence and adaptability."
   Category: Technology/Lifestyle
   Based on: 12 related posts
```
(1 consolidated trend representing the broader topic)

## Benefits

✅ **More Meaningful**: Distinct trends instead of duplicate posts  
✅ **Better Quality**: AI filters noise and identifies real patterns  
✅ **Engaging Content**: AI-generated descriptions are more compelling  
✅ **Accurate Categorization**: AI understands context better  
✅ **Scalable**: Can analyze 100+ posts in seconds  
✅ **Fallback**: Works even if Gemini fails (basic extraction)

## Cost & Limits

- **Gemini API**: FREE
- **Rate Limits**: 15 requests/min (more than enough)
- **Daily Limit**: 1500 requests/day
- **Each trend discovery**: Uses 1 request

You can discover new trends ~1500 times per day before hitting limits!

## Troubleshooting

### "Gemini API key not configured"
- Check `.env.local` file has the key
- Restart dev server after adding the key

### "AI analysis failed, using fallback"
- Check your API key is valid
- Check internet connection
- Verify you haven't hit rate limits
- The system will still work with fallback mode

### No trends returned
- Check browser console for detailed logs
- Look for "🤖 Analyzing Reddit posts with Gemini AI..."
- If you see AI logs, check the parsed response

## Console Logs to Monitor

When discovering trends, watch for:
- 🔍 Fetching trending posts from Reddit...
- 📊 Found X unique posts from Reddit
- ✅ X quality posts after filtering
- 🤖 Using AI to identify distinct trends...
- 🤖 Analyzing Reddit posts with Gemini AI...
- ✅ Gemini AI analysis complete
- 💎 Identified X distinct trends
- 💾 Saving X distinct trends to database...
- ✅ Successfully saved X distinct trends

## Testing

1. Get your Gemini API key
2. Add it to `.env.local`
3. Restart dev server: `npm run dev`
4. Navigate to Discover Trends page
5. Click "Discover New Trends"
6. Watch console for AI analysis logs
7. See ~15 distinct, well-categorized trends appear!

---

**Pro Tip**: The AI prompt can be customized in `src/lib/geminiApi.ts` to adjust how trends are identified and categorized.
