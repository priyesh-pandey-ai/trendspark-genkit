# Social Media Automation - Deployment Checklist

## ✅ Pre-Deployment (Before Going Live)

### 1. Install Dependencies
- [ ] Run `npm install papaparse` (or `bun add papaparse`)
- [ ] Verify installation: `npm list papaparse`
- [ ] Commit changes to package.json

### 2. Database Setup
- [ ] Log into Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Create new query and copy content from:
  `supabase/migrations/20251113000000_add_social_media_tables.sql`
- [ ] Execute the migration
- [ ] Verify tables created:
  - [ ] `social_media_integrations` table exists
  - [ ] `social_media_posts` table exists
  - [ ] `social_media_stats` table exists
- [ ] Verify RLS policies applied
- [ ] Verify indexes created

### 3. Regenerate Supabase Types
```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```
- [ ] Check that new tables are included in types
- [ ] Update Supabase client if needed

### 4. Deploy Edge Functions
```bash
# Deploy publishing function
supabase functions deploy publish-to-social-media

# Deploy scheduled executor
supabase functions deploy scheduled-post-executor
```
- [ ] Verify both functions deployed successfully
- [ ] Check function logs for any errors

### 5. Configure Cron Job
In Supabase Dashboard → Cron:
- [ ] Create new cron job
- [ ] Function: `scheduled-post-executor`
- [ ] Schedule: `*/5 * * * *` (every 5 minutes)
- [ ] Timeout: 60 seconds
- [ ] Enable the job

### 6. Build & Test
```bash
npm run build
```
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] All imports resolve correctly

### 7. Test Locally
```bash
npm run dev
```
- [ ] Navigate to Dashboard
- [ ] Check "Social Media" card appears
- [ ] Click Social Media → verify page loads
- [ ] Check all tabs load (Integrations, Scheduled Posts, Performance, Analytics)

### 8. Test Feature Workflow
- [ ] Add a test integration
  - [ ] Twitter/X (or another platform)
  - [ ] Enter dummy token
  - [ ] Verify account appears in list
  - [ ] Toggle enable/disable works
  - [ ] Delete integration works

- [ ] Test CSV Upload
  - [ ] Create test CSV file
  - [ ] Upload via "Import & Post from CSV"
  - [ ] Verify content preview shows
  - [ ] Verify row selection works
  - [ ] (Don't actually post with dummy token)

- [ ] Test Scheduled Posts Manager
  - [ ] Filter by status works
  - [ ] View post details works
  - [ ] Post immediately option appears

### 9. Security Check
- [ ] Verify user can only see their own integrations
- [ ] Verify RLS policies enforced
- [ ] Test with different user account
- [ ] Verify cross-user access blocked

---

## 🚀 Production Deployment

### Step 1: Deploy Code Changes
```bash
git add .
git commit -m "feat: add social media automation feature"
git push origin main
```
- [ ] Code deployed to production
- [ ] No deployment errors
- [ ] All tests passing

### Step 2: Database Migration (Production)
- [ ] Backup production database first
- [ ] Run migration in production Supabase
- [ ] Verify all 3 tables created
- [ ] Verify RLS policies applied

### Step 3: Deploy Functions (Production)
```bash
supabase functions deploy publish-to-social-media --project-ref <prod-id>
supabase functions deploy scheduled-post-executor --project-ref <prod-id>
```
- [ ] Both functions deployed
- [ ] Function logs show no errors

### Step 4: Configure Production Cron
- [ ] Create cron job in production
- [ ] Set schedule: `*/5 * * * *`
- [ ] Enable the job
- [ ] Monitor logs for first execution

### Step 5: Smoke Tests
- [ ] Log into production
- [ ] Test each major feature:
  - [ ] Can add integration
  - [ ] Can upload CSV
  - [ ] Can schedule post
  - [ ] Can view performance
  - [ ] Can view scheduled posts

### Step 6: Monitor
- [ ] Check Supabase logs for errors
- [ ] Monitor cron job execution
- [ ] Monitor function execution times
- [ ] Check for any database issues

---

## 📋 Post-Deployment Tasks

### Communication
- [ ] Notify users about new feature
- [ ] Share link to documentation
- [ ] Provide quick start guide
- [ ] Set up support channel for issues

### Documentation
- [ ] Verify all docs are up to date
- [ ] Test documentation examples work
- [ ] Check links are not broken
- [ ] Review for accuracy

### Monitoring
- [ ] Set up alerts for function errors
- [ ] Monitor database performance
- [ ] Track feature usage
- [ ] Monitor cron job success rate

### Feedback
- [ ] Collect user feedback
- [ ] Monitor bug reports
- [ ] Track feature requests
- [ ] Plan improvements

---

## 🔍 Testing Scenarios

### Scenario 1: Single Platform Post
1. Add Twitter integration
2. Create single CSV with Twitter post
3. Upload and post
4. Verify post appears in "Posted" status

### Scenario 2: Multi-Platform Bulk Post
1. Add 2+ integrations
2. Create CSV with multiple platforms
3. Upload and select all
4. Post all at once
5. Verify posts for each platform

### Scenario 3: Scheduled Post
1. Add integration
2. Create CSV with future time
3. Upload and schedule
4. Wait for scheduled time
5. Verify post executes automatically

### Scenario 4: Performance Tracking
1. Post several posts
2. Manually update stats in database (for testing)
3. View performance tab
4. Verify metrics display correctly

### Scenario 5: Error Handling
1. Use expired/invalid token
2. Try to post
3. Verify error logged
4. Post shows "Failed" status
5. Error message visible in UI

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Table not found" error | Migration not run | Execute migration SQL in Supabase |
| Functions not working | Not deployed | Run `supabase functions deploy` |
| Cron job not executing | Not configured | Set up cron in Supabase dashboard |
| Type errors | Types not regenerated | Run `supabase gen types` |
| Can't access integrations | RLS policies blocked | Check user auth session |
| CSV upload fails | Missing columns | Ensure "Platform" & "Content" columns |

---

## ✨ Success Criteria

- [x] All 3 database tables created
- [x] All RLS policies applied
- [x] Both edge functions deployed
- [x] Cron job configured and running
- [x] UI components load without errors
- [x] Can add integrations
- [x] Can upload CSV and post
- [x] Can schedule posts
- [x] Can view performance metrics
- [x] All tests passing
- [x] Documentation complete
- [x] No data security issues
- [x] Monitoring alerts configured

---

## 📞 Rollback Plan

If deployment fails:

### Immediate Actions
1. [ ] Disable cron job in Supabase
2. [ ] Disable edge functions
3. [ ] Revert code changes if needed
4. [ ] Notify team

### Database Rollback
1. [ ] Restore from backup
2. [ ] Verify data integrity
3. [ ] Test features work

### Function Rollback
1. [ ] Delete failed functions
2. [ ] Redeploy working version if available
3. [ ] Test functions

---

## 📝 Sign-off

- [ ] Developer: Tested locally _______________
- [ ] QA: Tested all scenarios _______________
- [ ] Product: Approved for release _______________
- [ ] Deployed by: _________________ Date: _______
- [ ] Verified in production by: _________________ Date: _______

---

**Date Completed**: _________________
**Version**: 1.0
**Status**: Ready for Deployment
