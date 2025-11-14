# Social Media Automation Feature Documentation

## Overview

The Social Media Automation feature allows you to connect your social media accounts and automatically post generated content to multiple platforms through a simple CSV import interface.

## Features

- **Multi-Platform Support**: Post to Twitter/X, Instagram, Facebook, LinkedIn, and TikTok
- **CSV Bulk Posting**: Import content directly from CSV files for batch posting
- **Scheduled Publishing**: Schedule posts for future dates and times
- **Analytics Dashboard**: Track engagement metrics across all platforms
- **Account Management**: Securely manage multiple social media account credentials
- **Post Tracking**: Monitor post status and view analytics for each published post

## Getting Started

### 1. Connect Social Media Accounts

Navigate to **Dashboard → Social Media → Integrations** and click **"Add Integration"**.

For each platform, you'll need to:

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create or select your app
3. Generate a **Bearer Token** from the "Keys and tokens" section
4. Copy and paste the Bearer Token in the integration form
5. Enter your Twitter handle and display name

#### Instagram
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create an app (if you don't have one)
3. Set up Instagram Basic Display or Instagram Graph API
4. Generate an **Access Token**
5. Copy and paste it in the integration form
6. Enter your Instagram username and display name

#### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create an app
3. Set up Facebook Page (if not already done)
4. Generate a **Page Access Token**
5. Copy and paste it in the integration form
6. Enter your page handle and display name

#### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create an app
3. Generate an **Access Token** with appropriate permissions
4. Copy and paste it in the integration form
5. Enter your LinkedIn username and display name

#### TikTok
1. Go to [TikTok Developer](https://developer.tiktok.com)
2. Create an app
3. Generate an **Access Token**
4. Copy and paste it in the integration form
5. Enter your TikTok handle and display name

### 2. Generate Content

Create content using the **Generate Content** feature. Your content will be optimized for each platform automatically.

### 3. Post to Social Media

#### Option A: Post Immediately
1. Go to **Content Library**
2. Click **"Import & Post from CSV"**
3. Upload a CSV file with your content (or use the download button to export existing content)
4. Select the rows you want to post
5. Click **"Post Now"**

#### Option B: Schedule Posts
1. Follow steps 1-4 above
2. Select a schedule time in the "Schedule Time" field
3. Click **"Schedule"**
4. Posts will be automatically published at the scheduled time

#### CSV Format

Your CSV file should have the following columns:

```
Platform,Content,Image URL,Hashtags
Twitter,"Check out this trend! #Innovation","https://example.com/image.jpg","#Tech #Trends"
Instagram,"Beautiful sunset vibes 🌅","https://example.com/sunset.jpg","#Instagram #Sunset"
LinkedIn,"Excited to share insights on AI","https://example.com/ai.jpg","#AI #Business"
```

Required columns:
- `Platform`: The social media platform (Twitter, Instagram, Facebook, LinkedIn, TikTok)
- `Content`: The post content/caption

Optional columns:
- `Image URL`: URL to an image to post with the content
- `Hashtags`: Hashtags to include in the post
- `Scheduled Time`: ISO format datetime (e.g., "2024-01-15T14:30:00")

### 4. Monitor Analytics

Navigate to **Dashboard → Social Media → Analytics** to view:

- **Total Engagement**: Likes, comments, and shares across all posts
- **Platform Performance**: See which platforms perform best
- **Engagement Trends**: Track metrics over time
- **Individual Post Stats**: View performance of specific posts

## Database Schema

### social_media_integrations
Stores encrypted credentials for connected social media accounts.

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- platform: VARCHAR(50) - Platform name
- access_token: TEXT - Encrypted access token
- refresh_token: TEXT - Encrypted refresh token (optional)
- token_expires_at: TIMESTAMP - Token expiration date
- account_handle: VARCHAR(255) - Social media username
- account_name: VARCHAR(255) - Display name
- is_active: BOOLEAN - Whether integration is active
- last_used_at: TIMESTAMP - Last usage timestamp
- created_at: TIMESTAMP - Creation timestamp
- updated_at: TIMESTAMP - Last update timestamp
```

### social_media_posts
Tracks posts published through the automation feature.

```sql
- id: UUID (Primary Key)
- content_kit_id: UUID (Foreign Key to content_kits)
- platform: VARCHAR(50) - Target platform
- external_post_id: VARCHAR(255) - Platform's post ID
- status: VARCHAR(50) - pending, scheduled, posted, failed, cancelled
- scheduled_at: TIMESTAMP - Scheduled posting time
- posted_at: TIMESTAMP - Actual posting time
- post_url: VARCHAR(500) - URL to the published post
- error_message: TEXT - Error details if posting failed
- metadata: JSONB - Platform-specific data
- created_at: TIMESTAMP - Creation timestamp
- updated_at: TIMESTAMP - Last update timestamp
```

### social_media_stats
Stores engagement metrics for published posts.

```sql
- id: UUID (Primary Key)
- post_id: UUID (Foreign Key to social_media_posts)
- platform: VARCHAR(50) - Platform name
- likes_count: INT - Number of likes
- comments_count: INT - Number of comments
- shares_count: INT - Number of shares
- views_count: INT - Number of views
- engagement_rate: DECIMAL - Calculated engagement rate
- last_updated_at: TIMESTAMP - Last metrics update
- created_at: TIMESTAMP - Creation timestamp
```

## API Endpoints

### publish-to-social-media
Edge Function that handles publishing posts to social media platforms.

**Request:**
```json
{
  "posts": [
    {
      "platform": "twitter",
      "content": "Post content",
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
      "postId": "post-id",
      "postUrl": "https://twitter.com/i/web/status/..."
    }
  ]
}
```

## Components

### SocialMediaSettings
Manages social media account integrations. Located at `src/components/SocialMediaSettings.tsx`

Features:
- Add new integrations
- View connected accounts
- Enable/disable integrations
- Delete integrations
- Track token expiration

### CSVUploadBulkPoster
Handles CSV upload and bulk posting workflow. Located at `src/components/CSVUploadBulkPoster.tsx`

Features:
- CSV file upload
- Content preview
- Row selection
- Immediate posting
- Scheduled posting
- Integration validation

### SocialMediaStats
Displays analytics and engagement metrics. Located at `src/components/SocialMediaStats.tsx`

Features:
- Engagement metrics overview
- Platform performance comparison
- Engagement trends over time
- Platform-specific statistics

### SocialMediaManagement
Main page for social media management. Located at `src/pages/SocialMediaManagement.tsx`

## Security Considerations

1. **Token Encryption**: All access tokens are encrypted in the database
2. **Row-Level Security**: Users can only see their own integrations and posts
3. **Token Refresh**: Refresh tokens are stored and used to maintain valid access
4. **Audit Trail**: All posts are tracked with timestamps and status updates
5. **Error Handling**: Failed posts are logged with error details for debugging

## Limitations & Notes

- **TikTok**: Requires video content, not supported for image-based posts
- **Rate Limiting**: Each platform has its own rate limits. Monitor your API usage
- **Token Expiration**: Some platforms require periodic token refresh
- **Character Limits**: Content is automatically truncated to platform limits
- **Image Formats**: Different platforms support different image formats and sizes
- **Scheduling**: Posts can be scheduled up to 30 days in advance (platform dependent)

## Troubleshooting

### "No integrations found"
- Go to Social Media Settings and add at least one account integration
- Ensure the integration is enabled (Active status)

### "Failed to post to [Platform]"
- Check if your access token is valid and not expired
- Verify the account handle is correct
- Check the error message in the Content Library for details
- Regenerate your access token from the platform's developer portal

### "Token Expired"
- Go to Social Media Settings
- Delete the expired integration
- Add a new integration with a fresh access token

### Posts showing as "pending" without posting
- Check the browser console for errors
- Verify your Supabase functions are deployed
- Check Supabase logs for function execution errors

## Future Enhancements

- [ ] Automatic token refresh
- [ ] Video support for all platforms
- [ ] Advanced scheduling with recurring posts
- [ ] Content optimization suggestions
- [ ] A/B testing for different post variations
- [ ] Hashtag suggestions and trending topics
- [ ] Post performance predictions
- [ ] Team collaboration for approvals
- [ ] Custom posting templates
- [ ] Integration with more platforms (BeReal, Threads, Bluesky, etc.)

## Support

For issues or feature requests, please contact the development team or create an issue in the project repository.
