# Social Media Automation - Quick Reference

## 🚀 Quick Start (5 Steps)

### Step 1: Install Package
```bash
npm install papaparse
```

### Step 2: Deploy Database Migration
Run the migration file in your Supabase dashboard:
```
supabase/migrations/20251113000000_add_social_media_tables.sql
```

### Step 3: Deploy Edge Functions
```bash
supabase functions deploy publish-to-social-media
supabase functions deploy scheduled-post-executor
```

### Step 4: Configure Cron Job
In Supabase Dashboard → Cron → New Job:
- Function: `scheduled-post-executor`
- Schedule: `*/5 * * * *` (every 5 minutes)
- Timeout: 60 seconds

### Step 5: Connect Your Accounts
1. Dashboard → Social Media → Integrations
2. Click "Add Integration"
3. Select platform and enter credentials
4. Save

---

## 📍 Navigation Map

```
Dashboard
├─ Social Media [NEW]
│  ├─ Integrations
│  │  └─ Add/Remove accounts, manage credentials
│  ├─ Scheduled Posts [NEW]
│  │  └─ View, schedule, cancel posts
│  ├─ Performance [NEW]
│  │  └─ Track post engagement & metrics
│  └─ Analytics
│     └─ Overall engagement statistics
└─ Content Library
   └─ Import & Post from CSV [ENHANCED]
      └─ Bulk post multiple items at once
```

---

## 🔑 API Credentials by Platform

### Twitter/X
- Portal: https://developer.twitter.com/en/portal/dashboard
- Get: Bearer Token
- Limits: 280 characters, rate limit varies

### Instagram
- Portal: https://developers.facebook.com
- Get: Access Token
- Limits: 2200 characters, requires image

### Facebook
- Portal: https://developers.facebook.com
- Get: Page Access Token
- Limits: 63206 characters

### LinkedIn
- Portal: https://www.linkedin.com/developers/apps
- Get: Access Token
- Limits: 3000 characters

### TikTok
- Portal: https://developer.tiktok.com
- Get: Access Token
- Note: Videos only, not images

---

## 📋 CSV Format

```csv
Platform,Content,Image URL,Hashtags,Scheduled Time
Twitter,My cool post,https://example.com/img.jpg,#Innovation #Tech,2024-01-20T14:30:00
Instagram,Beautiful moment,https://example.com/sunset.jpg,#InstaLife #Sunset,
LinkedIn,Announcing new features,https://example.com/office.jpg,#Business #Growth,2024-01-21T09:00:00
```

**Required**: Platform, Content  
**Optional**: Image URL, Hashtags, Scheduled Time

---

## ⚡ Common Tasks

### Task 1: Post Content Immediately
1. Go to Content Library
2. Click "Import & Post from CSV"
3. Upload CSV file
4. Select rows you want to post
5. Click "Post Now"

### Task 2: Schedule Posts
1. Go to Content Library
2. Click "Import & Post from CSV"
3. Upload CSV file
4. Set schedule time (e.g., tomorrow 9 AM)
5. Click "Schedule"

### Task 3: View Posted Content
1. Go to Social Media → Scheduled Posts
2. Filter by "Posted" status
3. Click on row to view details

### Task 4: Check Performance
1. Go to Social Media → Performance
2. View platform cards at the top
3. Scroll to see best/worst posts
4. Use insights for content planning

### Task 5: Manage Integrations
1. Go to Social Media → Integrations
2. View all connected accounts
3. Click "Disable" to temporarily pause
4. Click trash icon to remove

---

## 🔍 Monitoring & Troubleshooting

### Check Posting Status
- Social Media → Scheduled Posts
- Look for "OVERDUE" posts that haven't posted yet
- Click "Post Now" to force immediate posting

### View Post Performance
- Social Media → Performance tab
- See likes, comments, shares, views
- Engagement rate shown as percentage

### Debug Failed Posts
- Social Media → Scheduled Posts
- Filter by "Failed" status
- Hover over post to see error message
- Check integration is still active

### Monitor Integration Health
- Social Media → Integrations
- Red badge = Token expired
- Gray = Integration disabled
- Green = Active and ready

---

## 📊 Features at a Glance

| Feature | Available | Platform Support |
|---------|-----------|------------------|
| Connect Accounts | ✅ | All 5 platforms |
| Bulk Post from CSV | ✅ | All 5 platforms |
| Schedule Posts | ✅ | Twitter (limited), Instagram, Facebook, LinkedIn |
| Post Images | ✅ | Instagram, Facebook, LinkedIn, Twitter |
| Post Videos | ✅ | TikTok, Facebook, LinkedIn, Instagram |
| Track Performance | ✅ | All 5 platforms |
| Auto-execute Scheduled | ✅ | Via cron job |
| Multi-account per platform | ✅ | Yes |
| Rate limiting | ✅ | Per platform limits |
| Character limits | ✅ | Auto-truncated |

---

## 🔒 Security & Best Practices

1. **Token Storage**: All tokens encrypted at rest
2. **Access Control**: You only see your own data
3. **Audit Trail**: All actions logged
4. **Token Expiration**: Tracked and warned
5. **Error Logging**: Failed posts saved with details

### Best Practices
- ✅ Regularly refresh API tokens
- ✅ Monitor for token expiration warnings
- ✅ Test posts with single platform first
- ✅ Review content before bulk posting
- ✅ Check performance metrics regularly
- ✅ Remove unused integrations

---

## ❌ Limitations & Known Issues

| Limitation | Details | Workaround |
|-----------|---------|-----------|
| TikTok Video-only | No image posting | Use video format files |
| Rate Limiting | Platform-specific limits | Space out bulk posts |
| Token Refresh | Manual refresh required | Delete & re-add account |
| Scheduling | Platform-dependent windows | Schedule within limits |
| Character Limits | Auto-truncated | Preview before posting |

---

## 📈 Performance Tips

1. **Batch Posts**: Group similar content in same CSV
2. **Optimal Timing**: 9 AM, 12 PM, 6 PM work best
3. **Content Mix**: Vary hashtags and content types
4. **Image Size**: Keep under 5MB for faster upload
5. **Frequency**: Don't post more than 3x daily per platform

---

## 🆘 Troubleshooting Guide

### Posts Not Posting
**Solution**: Check Scheduled Posts tab for "OVERDUE" label, click "Post Now"

### Token Expired Error
**Solution**: Delete integration in Integrations tab, re-add with new token

### No Integrations Showing
**Solution**: Go to Social Media → Integrations → Add Integration

### CSV Upload Fails
**Solution**: Ensure CSV has "Platform" and "Content" columns

### Scheduled Posts Not Executing
**Solution**: Verify cron job is configured in Supabase

### Low Engagement
**Solution**: Check Performance tab, review best posts, analyze hashtags

---

## 💡 Pro Tips

1. **Export & Edit**: Export from Content Library, edit CSV, re-upload
2. **Test First**: Post to one platform first, check before others
3. **Track Best**: Note which platforms/content perform best
4. **Schedule Ahead**: Batch schedule content a week in advance
5. **Monitor Real-time**: Check performance daily for 7-30 days
6. **Optimize**: Use insights to improve future content

---

## 📞 Need Help?

- **Setup Issues**: See `SOCIAL_MEDIA_SETUP.md`
- **Detailed Docs**: See `SOCIAL_MEDIA_AUTOMATION.md`
- **Component Details**: Check code comments in component files
- **Edge Function Issues**: Check Supabase function logs

---

**Version**: 1.0  
**Last Updated**: November 13, 2025  
**Status**: ✅ Production Ready
