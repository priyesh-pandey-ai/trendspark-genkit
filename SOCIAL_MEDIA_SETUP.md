# Social Media Automation - Quick Setup Guide

## What's New

You now have a complete **Social Media Automation** feature that allows you to:

✅ Connect multiple social media accounts (Twitter, Instagram, Facebook, LinkedIn, TikTok)  
✅ Import content via CSV and post to multiple platforms  
✅ Schedule posts for future delivery  
✅ Track engagement analytics across all platforms  
✅ Manage multiple integrations per platform  

## Installation & Setup

### Step 1: Install Dependencies

Add the new dependency to your project:

```bash
npm install papaparse
# or
bun add papaparse
```

### Step 2: Deploy Database Migration

The migration creates three new tables in Supabase:

1. **social_media_integrations** - Stores encrypted account credentials
2. **social_media_posts** - Tracks all published posts
3. **social_media_stats** - Stores engagement metrics

Run this migration in your Supabase project:

```bash
supabase migration up
```

Or manually run: `supabase/migrations/20251113000000_add_social_media_tables.sql`

### Step 3: Deploy Edge Function

Deploy the social media publishing function:

```bash
supabase functions deploy publish-to-social-media
```

### Step 4: Update Your Environment

Make sure your `.env` file has:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Feature Overview

### 1. Social Media Settings Page

**Location:** Dashboard → Social Media → Integrations

Connect your social media accounts here. For each platform:

- **Twitter/X**: Requires Bearer Token from Developer Portal
- **Instagram**: Requires Access Token from Facebook Developers
- **Facebook**: Requires Page Access Token
- **LinkedIn**: Requires Access Token with appropriate permissions
- **TikTok**: Requires Access Token from TikTok Developer

### 2. CSV Bulk Posting

**Location:** Content Library → "Import & Post from CSV"

Features:
- Upload CSV with content
- Preview before posting
- Select rows to post
- Post immediately or schedule for later
- Track all posts in the system

### 3. Analytics Dashboard

**Location:** Dashboard → Social Media → Analytics

View:
- Total engagement metrics
- Performance by platform
- Engagement trends
- Individual post performance

## File Structure

New files added:

```
src/
  components/
    CSVUploadBulkPoster.tsx          # CSV upload & bulk posting UI
    SocialMediaSettings.tsx           # Account management
    SocialMediaStats.tsx              # Analytics dashboard
  lib/
    socialMediaApi.ts                 # API client for each platform
  pages/
    SocialMediaManagement.tsx          # Main social media page
  types/
    socialMedia.ts                     # TypeScript types
    
supabase/
  functions/
    publish-to-social-media/
      index.ts                        # Edge function for posting
  migrations/
    20251113000000_add_social_media_tables.sql  # Database schema
```

## CSV Format Example

```csv
Platform,Content,Image URL,Hashtags
Twitter,Great new product launch!,https://example.com/product.jpg,#NewProduct #Innovation
Instagram,Check out our story,https://example.com/story.jpg,#Instagram #Lifestyle
LinkedIn,Excited about our journey,https://example.com/office.jpg,#Business #Growth
```

**Required columns:** Platform, Content  
**Optional columns:** Image URL, Hashtags, Scheduled Time

## Getting API Credentials

### Twitter/X
1. Visit https://developer.twitter.com/en/portal/dashboard
2. Click "Create Project"
3. Go to "Keys and Tokens"
4. Generate "Bearer Token"

### Instagram
1. Visit https://developers.facebook.com
2. Create App → Business
3. Add Instagram Product
4. Generate Access Token

### Facebook
1. Visit https://developers.facebook.com
2. Create App → Business
3. Add Facebook Product
4. Generate Page Access Token

### LinkedIn
1. Visit https://www.linkedin.com/developers/apps
2. Create app
3. Go to Auth
4. Generate Access Token

### TikTok
1. Visit https://developer.tiktok.com
2. Create Application
3. Go to Development → Production
4. Generate Access Token

## Usage Workflow

```
1. Generate Content
   └─> Dashboard → Generate Content Kit
   
2. Add Social Media Accounts
   └─> Dashboard → Social Media → Integrations → Add Integration
   
3. Post to Social Media
   └─> Content Library → Import & Post from CSV
       ├─> Upload CSV
       ├─> Select rows
       └─> Post Now or Schedule
       
4. Monitor Performance
   └─> Dashboard → Social Media → Analytics
```

## Database Schema

### social_media_integrations
```
id (UUID) - Primary key
user_id - Links to auth user
platform - twitter|instagram|facebook|linkedin|tiktok
access_token - Encrypted
refresh_token - Encrypted (optional)
account_handle - @username
account_name - Display name
is_active - Boolean
last_used_at - Timestamp
```

### social_media_posts
```
id (UUID) - Primary key
content_kit_id - Links to generated content
platform - Target platform
external_post_id - Platform's ID
status - pending|scheduled|posted|failed
scheduled_at - Future posting time
posted_at - Actual posting time
post_url - Link to posted content
error_message - If posting failed
```

### social_media_stats
```
id (UUID) - Primary key
post_id - Links to social_media_posts
platform - Platform name
likes_count - Number of likes
comments_count - Number of comments
shares_count - Number of shares
views_count - Number of views
engagement_rate - Calculated percentage
```

## API Endpoints

### POST /functions/v1/publish-to-social-media

Publishes posts to social media platforms.

**Request:**
```json
{
  "posts": [
    {
      "platform": "twitter",
      "content": "My post content",
      "imageUrl": "https://example.com/image.jpg",
      "hashtags": "#Tag1 #Tag2"
    }
  ],
  "integrations": [
    {
      "id": "integration-uuid",
      "platform": "twitter",
      "access_token": "token",
      "account_handle": "@handle"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "platform": "twitter",
      "success": true,
      "postId": "123456789",
      "postUrl": "https://twitter.com/i/web/status/123456789"
    }
  ]
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No integrations showing | Go to Social Media Settings and add an account |
| Failed to post | Check token validity in developer portal |
| Token expired | Delete integration and add new token |
| CSV not uploading | Ensure CSV has required columns (Platform, Content) |
| Posts not appearing | Check Supabase function logs for errors |

## Limitations

- TikTok requires video content (images not supported)
- Each platform has character limits
- Rate limiting applies per platform
- Some platforms only support scheduling within 7-75 days
- Tokens may expire and need refresh

## Next Steps

1. Install dependencies: `npm install papaparse`
2. Deploy migrations to Supabase
3. Deploy edge function: `supabase functions deploy publish-to-social-media`
4. Connect your first social media account
5. Generate some content and test posting

## Support & Documentation

For detailed documentation, see: `SOCIAL_MEDIA_AUTOMATION.md`

For API specifications and advanced usage, check the component files:
- `CSVUploadBulkPoster.tsx` - Bulk posting logic
- `SocialMediaSettings.tsx` - Account management
- `socialMediaApi.ts` - API implementations
