# GitHub Workflows

This directory contains automated workflows for the Trend-Craft AI project.

## Workflows

### Discover Trends (`discover-trends.yml`)

Automatically discovers trending topics from multiple sources (Reddit, Twitter, Google Trends) and stores them in the database.

**Schedule:** Runs every 6 hours automatically

**Manual Trigger:** Can be triggered manually from the GitHub Actions tab

#### Setup Required

This workflow uses the same Supabase secrets as your Azure Static Web App deployment:

| Secret Name | Description |
|-------------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (already configured) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key (already configured) |

**Note:** If you've already deployed the app to Azure, these secrets should already be configured and the workflow will work automatically.

#### Workflow Behavior

- **Without secrets configured:** The workflow will skip trend discovery and show a warning with setup instructions
- **With secrets configured:** The workflow will call the Supabase Edge Function to discover and store trends

#### Troubleshooting

**Workflow shows warnings about missing secrets:**
- The secrets should already be configured if you deployed to Azure
- If not, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in GitHub Settings → Secrets and variables → Actions
- After adding secrets, the next scheduled run (or manual trigger) will work normally

**Workflow fails with HTTP errors:**
- Check that your Supabase Edge Function is deployed: `supabase functions deploy discover-trends`
- Verify your Supabase project is active (not paused)
- Check Edge Function logs in Supabase Dashboard for detailed errors

**No trends appearing in the app:**
- Manually trigger the workflow from Actions tab to test
- Check the workflow logs for any errors
- Verify the Edge Function logs in Supabase Dashboard
- Ensure your database migrations are up to date

For detailed setup instructions, see [DEPLOYMENT.md](../../DEPLOYMENT.md) in the project root.

### Azure Static Web Apps

Handles deployment of the frontend application to Azure.

**Trigger:** Runs on push to main and pull requests

This workflow is auto-configured by Azure and doesn't require additional setup.
