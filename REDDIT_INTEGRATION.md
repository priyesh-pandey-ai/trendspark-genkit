# Reddit Trend Discovery Integration

This guide explains how to set up and use Reddit API integration to discover trending topics for your Trend-Craft AI application.

## 🚀 Features

- **Automated Trend Discovery**: Fetch top trending posts from Reddit's r/all and r/popular
- **Smart Categorization**: Automatically categorizes trends into Technology, Business, Marketing, Health, and Lifestyle
- **Quality Filtering**: Filters out NSFW, low-engagement, and spam posts
- **Engagement Metrics**: Calculates engagement scores and growth rates from Reddit metrics
- **Real-time Updates**: Discover fresh trends on-demand from the UI

## 📋 Prerequisites

You need Reddit API credentials to use this integration. Follow these steps:

### Step 1: Create a Reddit App

1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Log in with your Reddit account (create one if you don't have it)
3. Scroll down and click **"Create App"** or **"Create Another App"**
4. Fill in the form:
   - **name**: `TrendCraftAI` (or any name you prefer)
   - **App type**: Select **"script"** (important!)
   - **description**: `Trend discovery for content creation`
   - **about url**: Leave blank or use your website
   - **redirect uri**: `http://localhost:8080` (required but not used)
5. Click **"Create app"**

### Step 2: Get Your Credentials

After creating the app, you'll see:
- **Client ID**: The string under your app name (looks like: `Ab12CdEf34GhIj`)
- **Secret**: Labeled as "secret" (looks like: `Ab12CdEf34GhIjKlMn56OpQr78StUv`)

### Step 3: Add to Environment Variables

Open your `.env.local` file and replace the placeholder values:

```bash
VITE_REDDIT_CLIENT_ID=your_actual_client_id_here
VITE_REDDIT_CLIENT_SECRET=your_actual_secret_here
```

**Important**: Never commit these credentials to Git. The `.env.local` file is already in `.gitignore`.

## 🎯 How It Works

### Architecture

```
User clicks "Discover New Trends"
    ↓
triggerTrendDiscovery() in trendDiscovery.ts
    ↓
discoverRedditTrends() in redditApi.ts
    ↓
1. Authenticate with Reddit OAuth
2. Fetch from r/all and r/popular
3. Filter quality posts (score > 100, comments > 10)
4. Categorize posts by subreddit
5. Calculate engagement scores
6. Transform to Trend format
7. Save top 25 to Supabase database
    ↓
UI refreshes with new Reddit trends
```

### Data Flow

1. **Authentication**: Uses OAuth client credentials flow to get an access token
2. **Fetching**: Pulls hot posts from r/all (50) and r/popular (30)
3. **Deduplication**: Removes duplicate posts based on title
4. **Quality Filter**: Applies these criteria:
   - Not NSFW (`over_18 = false`)
   - Minimum score of 100 upvotes
   - At least 10 comments
   - Not from spam/low-quality subreddits
5. **Categorization**: Maps subreddits to categories:
   - Technology: tech, programming, AI, webdev, etc.
   - Business: entrepreneur, startup, finance, investing
   - Marketing: marketing, advertising, socialmedia
   - Health: health, fitness, nutrition, wellness
   - Lifestyle: everything else
6. **Metrics Calculation**:
   - **Engagement Score**: `(upvotes × 0.7) + (comments × 1.5)`
   - **Growth Rate**: Based on score per hour since posting
7. **Storage**: Top 25 trends saved to `trends` table in Supabase

## 🎨 Usage

### From the UI

1. Navigate to **Discover Trends** page (`/discover-trends`)
2. Click the **"Discover New Trends"** button
3. Wait for the discovery process (usually 3-5 seconds)
4. New Reddit trends will appear in the grid with 🔥 Reddit badge
5. Click **"Generate Content"** on any trend to create posts

### Programmatically

```typescript
import { discoverRedditTrends } from '@/lib/redditApi';

// Discover trends from all of Reddit
const result = await discoverRedditTrends();

if (result.success) {
  console.log(`Discovered ${result.trendsDiscovered} trends!`);
} else {
  console.error(`Error: ${result.error}`);
}
```

### Discover from Specific Subreddits

```typescript
import { discoverSubredditTrends } from '@/lib/redditApi';

// Discover trends from r/technology
const result = await discoverSubredditTrends('technology', 20);
```

## 🔍 Understanding the Trends

### Source Badge Colors

In the UI, trends are labeled by source with colored badges:
- 🔥 **Reddit**: Orange badge
- 🐦 **Twitter**: Blue badge  
- 📊 **Google Trends**: Purple badge
- ✏️ **Manual**: Gray badge

### Trend Metrics

Each trend displays:
- **Growth Rate**: Percentage showing how fast it's trending (10% - 200%)
- **Engagement Score**: Combined metric of upvotes and comments
- **Category**: Auto-categorized based on subreddit
- **Topic**: The Reddit post title
- **Description**: Excerpt from post text (first 200 chars)

## 🛠️ Customization

### Adjust Quality Thresholds

Edit `src/lib/redditApi.ts`:

```typescript
function filterQualityPosts(posts: RedditPost[]): RedditPost[] {
  return posts.filter(post => {
    const { score, num_comments } = post.data;
    
    // Customize these thresholds:
    const isQuality = 
      score >= 100 &&        // Minimum upvotes (change as needed)
      num_comments >= 10;    // Minimum comments (change as needed)
    
    return isQuality;
  });
}
```

### Add New Categories

Update the `categorizePost` function:

```typescript
function categorizePost(post: RedditPost): string {
  const subreddit = post.data.subreddit.toLowerCase();
  
  // Add your category:
  if (subreddit.includes('gaming') || subreddit.includes('esports')) {
    return 'Gaming';
  }
  
  // ... rest of categories
}
```

### Change Number of Trends

In `discoverRedditTrends()`:

```typescript
// Take top 25 trends (change this number)
const topTrends = trends
  .sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))
  .slice(0, 25);  // Change to 50, 100, etc.
```

## 🐛 Troubleshooting

### "Failed to authenticate with Reddit"

**Problem**: Invalid or missing credentials

**Solution**:
1. Double-check your `.env.local` file
2. Ensure no extra spaces in the credentials
3. Verify the app type is "script" in Reddit settings
4. Restart the dev server after updating `.env.local`

### "No quality posts found"

**Problem**: Reddit returned posts but none met quality threshold

**Solution**:
1. Lower the quality thresholds in `filterQualityPosts()`
2. Try different time of day (Reddit activity varies)
3. Check if Reddit API is accessible in your region

### "Rate limit exceeded"

**Problem**: Made too many requests to Reddit

**Solution**:
1. Reddit allows 60 requests per minute per IP
2. Wait 1 minute before trying again
3. Implement caching to reduce API calls

### CORS Errors

**Problem**: Browser blocking Reddit API calls

**Solution**: 
The integration uses OAuth which should avoid CORS issues. If you still see them:
1. Reddit API requires OAuth authentication (implemented)
2. Consider creating a backend proxy if issues persist

## 📊 Best Practices

1. **Rate Limiting**: Don't call `discoverRedditTrends()` too frequently (max once per hour)
2. **Caching**: The app already stores trends in Supabase - use those instead of re-fetching
3. **Error Handling**: Always check the `success` property in returned results
4. **Privacy**: Never log or expose your Reddit credentials
5. **Content Review**: Review trends before generating content to ensure brand safety

## 🔒 Security Notes

- **Never commit** `.env.local` to version control
- **Rotate credentials** if accidentally exposed
- **Use environment variables** only (never hardcode credentials)
- **Limit access** to production credentials to authorized team members

## 📈 Monitoring

Check console logs for:
- `🔍 Fetching trending posts from Reddit...`
- `📊 Found X unique posts`
- `✅ X quality posts after filtering`
- `💾 Saved X Reddit trends to database`

## 🚦 Next Steps

1. ✅ Set up Reddit API credentials
2. ✅ Test the "Discover New Trends" button
3. ✅ Verify trends appear with Reddit badge
4. ✅ Generate content from a Reddit trend
5. 🎯 Customize categories and thresholds for your needs
6. 🎯 Set up automated daily trend discovery (optional)

## 📝 Notes

- Reddit trends refresh based on "hot" algorithm (posts trending RIGHT NOW)
- Trends are permanent once saved - won't disappear when Reddit's algorithm changes
- You can manually delete trends from Supabase dashboard if needed
- The integration respects Reddit's ToS and rate limits

---

**Need help?** Check the main [README.md](./README.md) or open an issue on GitHub.
