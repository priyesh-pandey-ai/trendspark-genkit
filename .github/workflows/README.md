# GitHub Workflows

This directory contains automated workflows for the Trend-Craft AI project.

## Workflows

### Discover Trends (`discover-trends.yml`)

Automatically discovers trending topics from multiple sources (Reddit, Twitter, Google Trends) and stores them in the database.

**Schedule:** Runs every 6 hours automatically

**Manual Trigger:** Can be triggered manually from the GitHub Actions tab

#### Setup Required

To enable this workflow, you need to configure the following GitHub repository secrets:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `SUPABASE_URL` | Your Supabase project URL | Found in your Supabase project settings (e.g., `https://your-project.supabase.co`) |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Found in your Supabase project settings under API keys |

#### Finding Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** for `SUPABASE_URL`
5. Copy the **anon/public** key for `SUPABASE_ANON_KEY`

#### Workflow Behavior

- **Without secrets configured:** The workflow will skip trend discovery and show a warning with setup instructions
- **With secrets configured:** The workflow will call the Supabase Edge Function to discover and store trends

#### Troubleshooting

**Workflow shows warnings about missing secrets:**
- Follow the setup instructions above to add the required secrets
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
