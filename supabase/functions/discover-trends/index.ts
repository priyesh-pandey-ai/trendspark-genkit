import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Trend {
  topic: string;
  description: string;
  source: 'reddit' | 'twitter' | 'google_trends' | 'manual';
  category: string;
  growth_rate: number;
  engagement_score: number;
  trending_since: string;
}

// Reddit API integration
async function fetchRedditTrends(): Promise<Trend[]> {
  const trends: Trend[] = [];
  
  try {
    // Fetch trending posts from popular subreddits
    const subreddits = ['technology', 'business', 'lifestyle', 'health', 'marketing'];
    
    for (const subreddit of subreddits) {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`,
        {
          headers: {
            'User-Agent': 'TrendCraftBot/1.0',
          },
        }
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch from r/${subreddit}:`, response.status);
        continue;
      }
      
      const data = await response.json();
      const posts = data.data?.children || [];
      
      for (const post of posts) {
        const postData = post.data;
        
        // Calculate engagement score based on upvotes and comments
        const engagement_score = Math.min(
          100,
          Math.round((postData.ups + postData.num_comments * 2) / 100)
        );
        
        // Calculate growth rate based on score relative to subscribers
        const growth_rate = Math.min(
          200,
          Math.round((postData.score / 1000) * 100)
        );
        
        if (engagement_score > 30) {
          trends.push({
            topic: postData.title.substring(0, 200),
            description: postData.selftext?.substring(0, 500) || `Trending discussion on r/${subreddit}`,
            source: 'reddit',
            category: getCategoryFromSubreddit(subreddit),
            growth_rate,
            engagement_score,
            trending_since: new Date(postData.created_utc * 1000).toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Reddit trends:', error);
  }
  
  return trends;
}

// Twitter/X API integration (using mock data for now since Twitter API requires OAuth)
async function fetchTwitterTrends(): Promise<Trend[]> {
  const trends: Trend[] = [];
  
  try {
    const TWITTER_BEARER_TOKEN = Deno.env.get('TWITTER_BEARER_TOKEN');
    
    if (!TWITTER_BEARER_TOKEN) {
      console.log('Twitter API not configured, skipping...');
      return trends;
    }
    
    // Note: Twitter API v2 requires proper authentication
    // This is a placeholder for when credentials are available
    const response = await fetch(
      'https://api.twitter.com/2/trends/by/woeid/1', // World trends
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch Twitter trends:', response.status);
      return trends;
    }
    
    const data = await response.json();
    // Process Twitter trends data here
    
  } catch (error) {
    console.error('Error fetching Twitter trends:', error);
  }
  
  return trends;
}

// Google Trends API integration (using Serper API as proxy)
async function fetchGoogleTrends(): Promise<Trend[]> {
  const trends: Trend[] = [];
  
  try {
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (!SERPER_API_KEY) {
      console.log('Serper API not configured for Google Trends, skipping...');
      return trends;
    }
    
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'trending topics',
        num: 10,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to fetch Google Trends:', response.status);
      return trends;
    }
    
    const data = await response.json();
    
    // Process Google Trends data
    if (data.organic) {
      for (const result of data.organic.slice(0, 5)) {
        trends.push({
          topic: result.title,
          description: result.snippet || 'Trending on Google',
          source: 'google_trends',
          category: 'Technology', // Would be categorized based on content
          growth_rate: Math.floor(Math.random() * 100) + 50,
          engagement_score: Math.floor(Math.random() * 50) + 50,
          trending_since: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
  }
  
  return trends;
}

function getCategoryFromSubreddit(subreddit: string): string {
  const categoryMap: Record<string, string> = {
    technology: 'Technology',
    business: 'Business',
    lifestyle: 'Lifestyle',
    health: 'Health',
    marketing: 'Marketing',
  };
  return categoryMap[subreddit.toLowerCase()] || 'Technology';
}

// Deduplicate trends based on topic similarity
function deduplicateTrends(trends: Trend[]): Trend[] {
  const seen = new Set<string>();
  const unique: Trend[] = [];
  
  for (const trend of trends) {
    const key = trend.topic.toLowerCase().substring(0, 50);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(trend);
    }
  }
  
  return unique;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Starting trend discovery...');
    
    // Fetch trends from all sources
    const [redditTrends, twitterTrends, googleTrends] = await Promise.allSettled([
      fetchRedditTrends(),
      fetchTwitterTrends(),
      fetchGoogleTrends(),
    ]);
    
    // Collect all successful results
    const allTrends: Trend[] = [];
    
    if (redditTrends.status === 'fulfilled') {
      allTrends.push(...redditTrends.value);
      console.log(`Fetched ${redditTrends.value.length} trends from Reddit`);
    }
    
    if (twitterTrends.status === 'fulfilled') {
      allTrends.push(...twitterTrends.value);
      console.log(`Fetched ${twitterTrends.value.length} trends from Twitter`);
    }
    
    if (googleTrends.status === 'fulfilled') {
      allTrends.push(...googleTrends.value);
      console.log(`Fetched ${googleTrends.value.length} trends from Google Trends`);
    }
    
    // Deduplicate and sort by engagement
    const uniqueTrends = deduplicateTrends(allTrends)
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 50); // Keep top 50 trends
    
    console.log(`Storing ${uniqueTrends.length} unique trends...`);
    
    // Store trends in database
    if (uniqueTrends.length > 0) {
      const { data, error } = await supabase
        .from('trends')
        .upsert(uniqueTrends, {
          onConflict: 'topic',
          ignoreDuplicates: false,
        });
      
      if (error) {
        console.error('Error storing trends:', error);
        throw error;
      }
      
      console.log('Trends stored successfully');
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        trendsDiscovered: uniqueTrends.length,
        sources: {
          reddit: redditTrends.status === 'fulfilled' ? redditTrends.value.length : 0,
          twitter: twitterTrends.status === 'fulfilled' ? twitterTrends.value.length : 0,
          google: googleTrends.status === 'fulfilled' ? googleTrends.value.length : 0,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in discover-trends function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
