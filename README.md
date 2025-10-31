# Trend-Craft AI - GenAI Trend-to-Content Studio

Transform emerging trends into brand-ready social media content with AI-powered voice matching and multi-platform optimization.

## Project info

**URL**: https://lovable.dev/projects/120e73e4-1bb3-4e63-acb7-418cd94526fe

## Features

- 🔥 **Trend Discovery**: Automatically discover trending topics from Reddit, Twitter, and Google Trends
- 🎯 **Brand Voice Matching**: AI-powered brand voice extraction and content generation
- 📱 **Multi-Platform Support**: Generate optimized content for Instagram, LinkedIn, Twitter, Facebook, and TikTok
- 📊 **Analytics Dashboard**: Track content performance across platforms
- 📚 **Content Library**: Manage and organize all your generated content

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/120e73e4-1bb3-4e63-acb7-418cd94526fe) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI**: Lovable AI Gateway (Gemini 2.5 Flash)
- **Trend Sources**: Reddit API, Twitter API, Google Trends (via Serper)

## Trend Discovery System

The application includes an automated trend discovery system that fetches trending topics from multiple sources.

### Setup Trend Discovery

1. **Configure GitHub Secrets** (for automated trend updates):
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

2. **Optional API Keys** (add to Supabase Edge Function secrets):
   - `TWITTER_BEARER_TOKEN`: For Twitter/X trends
   - `SERPER_API_KEY`: For Google Trends proxy

3. **Manual Trigger**: 
   - Go to Actions tab → "Discover Trends" → "Run workflow"
   - Or call the edge function directly: `/functions/v1/discover-trends`

4. **Automatic Updates**: 
   - Trends are automatically discovered every 6 hours via GitHub Actions
   - Configure schedule in `.github/workflows/discover-trends.yml`

For detailed setup instructions, see [Trend Discovery Documentation](supabase/functions/discover-trends/README.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/120e73e4-1bb3-4e63-acb7-418cd94526fe) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
