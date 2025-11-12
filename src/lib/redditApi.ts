/**
 * Reddit API Integration
 * Fetches trending posts from Reddit's /r/all and /r/popular endpoints
 * and transforms them into the Trend format for the application
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TrendInsert = Database['public']['Tables']['trends']['Insert'];

// Category to subreddit mapping
export const TREND_CATEGORIES = {
  all: {
    name: 'All Categories',
    subreddits: ['all', 'popular'],
    description: 'Trending across all of Reddit',
  },
  technology: {
    name: 'Technology',
    subreddits: ['technology', 'programming', 'artificial', 'machinelearning', 'coding', 'tech'],
    description: 'Latest in tech, AI, and programming',
  },
  business: {
    name: 'Business',
    subreddits: ['business', 'entrepreneur', 'startups', 'smallbusiness', 'Entrepreneur', 'finance'],
    description: 'Business insights and entrepreneurship',
  },
  marketing: {
    name: 'Marketing',
    subreddits: ['marketing', 'socialmedia', 'advertising', 'SEO', 'PPC', 'content_marketing'],
    description: 'Marketing strategies and social media',
  },
  health: {
    name: 'Health & Fitness',
    subreddits: ['Health', 'fitness', 'nutrition', 'Wellness', 'bodyweightfitness', 'running'],
    description: 'Health, fitness, and wellness trends',
  },
  lifestyle: {
    name: 'Lifestyle',
    subreddits: ['lifestyle', 'LifeProTips', 'productivity', 'selfimprovement', 'minimalism'],
    description: 'Life hacks and personal development',
  },
  finance: {
    name: 'Finance & Investing',
    subreddits: ['investing', 'stocks', 'personalfinance', 'CryptoCurrency', 'wallstreetbets', 'economics'],
    description: 'Financial markets and investment trends',
  },
  gaming: {
    name: 'Gaming',
    subreddits: ['gaming', 'Games', 'pcgaming', 'PS5', 'xbox', 'NintendoSwitch'],
    description: 'Video games and esports',
  },
  science: {
    name: 'Science',
    subreddits: ['science', 'Physics', 'space', 'Futurology', 'biology', 'chemistry'],
    description: 'Scientific discoveries and innovation',
  },
  entertainment: {
    name: 'Entertainment',
    subreddits: ['entertainment', 'movies', 'television', 'Music', 'netflix', 'youtube'],
    description: 'Movies, TV shows, and pop culture',
  },
} as const;

export type TrendCategoryKey = keyof typeof TREND_CATEGORIES;

interface RedditPost {
  data: {
    title: string;
    subreddit: string;
    selftext: string;
    score: number;
    ups: number;
    num_comments: number;
    created_utc: number;
    author: string;
    permalink: string;
    url: string;
    over_18: boolean;
    link_flair_text?: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
    after?: string;
  };
}

/**
 * Gets Reddit OAuth access token using client credentials flow
 */
async function getRedditAccessToken(): Promise<string | null> {
  const clientId = import.meta.env.VITE_REDDIT_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Reddit API credentials not configured');
    console.error('Please set VITE_REDDIT_CLIENT_ID and VITE_REDDIT_CLIENT_SECRET in .env.local');
    return null;
  }

  console.log('🔑 Authenticating with Reddit API...');

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Reddit auth failed (${response.status}):`, errorText);
      throw new Error(`Reddit auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Reddit authentication successful');
    return data.access_token;
  } catch (error) {
    console.error('❌ Error getting Reddit access token:', error);
    return null;
  }
}

/**
 * Fetches trending posts from Reddit
 */
async function fetchRedditTrendingPosts(
  subreddit: string = 'all',
  timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
  limit: number = 50
): Promise<RedditPost[]> {
  const accessToken = await getRedditAccessToken();

  if (!accessToken) {
    throw new Error('Failed to authenticate with Reddit');
  }

  try {
    const url = `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}&t=${timeframe}`;
    
    console.log(`📥 Fetching posts from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'TrendCraftAI/1.0.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Reddit API error (${response.status}):`, errorText);
      throw new Error(`Reddit API error: ${response.statusText}`);
    }

    const data: RedditResponse = await response.json();
    console.log(`✅ Fetched ${data.data.children.length} posts from r/${subreddit}`);
    return data.data.children;
  } catch (error) {
    console.error('❌ Error fetching Reddit posts:', error);
    throw error;
  }
}

/**
 * Categorizes a Reddit post based on subreddit and flair
 */
function categorizePost(post: RedditPost): string {
  const subreddit = post.data.subreddit.toLowerCase();
  const flair = post.data.link_flair_text?.toLowerCase() || '';
  
  // Technology
  if (
    subreddit.includes('tech') ||
    subreddit.includes('programming') ||
    subreddit.includes('software') ||
    subreddit.includes('ai') ||
    subreddit.includes('machinelearning') ||
    ['technology', 'programming', 'artificial', 'javascript', 'python', 'webdev'].some(t => subreddit.includes(t))
  ) {
    return 'Technology';
  }
  
  // Business
  if (
    subreddit.includes('business') ||
    subreddit.includes('entrepreneur') ||
    subreddit.includes('startup') ||
    subreddit.includes('finance') ||
    subreddit.includes('investing')
  ) {
    return 'Business';
  }
  
  // Marketing
  if (
    subreddit.includes('marketing') ||
    subreddit.includes('advertising') ||
    subreddit.includes('socialmedia')
  ) {
    return 'Marketing';
  }
  
  // Health & Fitness
  if (
    subreddit.includes('health') ||
    subreddit.includes('fitness') ||
    subreddit.includes('nutrition') ||
    subreddit.includes('wellness')
  ) {
    return 'Health';
  }
  
  // Lifestyle (default)
  return 'Lifestyle';
}

/**
 * Calculates engagement score from Reddit metrics
 */
function calculateEngagementScore(post: RedditPost): number {
  const { score, num_comments } = post.data;
  // Engagement score is a weighted combination of upvotes and comments
  // Comments are weighted higher as they indicate deeper engagement
  return Math.round(score * 0.7 + num_comments * 1.5);
}

/**
 * Calculates growth rate estimation based on post age and score
 */
function calculateGrowthRate(post: RedditPost): number {
  const { score, created_utc } = post.data;
  const ageInHours = (Date.now() / 1000 - created_utc) / 3600;
  
  // Avoid division by zero
  if (ageInHours < 1) return 100;
  
  // Calculate score per hour and normalize
  const scorePerHour = score / ageInHours;
  
  // Convert to a percentage growth rate (capped at 200%)
  const growthRate = Math.min(Math.round(scorePerHour * 2), 200);
  
  return Math.max(growthRate, 10); // Minimum 10% for visibility
}

/**
 * Transforms a Reddit post into a Trend object
 */
function transformRedditPostToTrend(post: RedditPost): TrendInsert {
  const { title, selftext, created_utc, subreddit } = post.data;
  
  // Create a concise description from selftext
  let description = selftext ? selftext.substring(0, 200) : title;
  if (selftext && selftext.length > 200) {
    description += '...';
  }
  
  return {
    topic: title,
    description,
    category: categorizePost(post),
    source: 'reddit',
    engagement_score: calculateEngagementScore(post),
    growth_rate: calculateGrowthRate(post),
    trending_since: new Date(created_utc * 1000).toISOString(),
  };
}

/**
 * Filters out low-quality or NSFW posts
 */
function filterQualityPosts(posts: RedditPost[]): RedditPost[] {
  return posts.filter(post => {
    const { score, num_comments, over_18, subreddit } = post.data;
    
    // Filter criteria (relaxed to get more posts for AI analysis):
    // 1. Not NSFW
    // 2. Minimum score threshold (lowered to 50)
    // 3. Has some engagement (lowered to 5 comments)
    // 4. Not from banned/low-quality subreddits
    
    const bannedSubreddits = ['circlejerk', 'copypasta', 'shitpost'];
    const isQuality = 
      !over_18 &&
      score >= 50 &&  // Lowered from 100
      num_comments >= 5 &&  // Lowered from 10
      !bannedSubreddits.some(banned => subreddit.toLowerCase().includes(banned));
    
    return isQuality;
  });
}

/**
 * Main function to discover trends from Reddit and save to database
 * @param categoryKey - The category to fetch trends for (e.g., 'all', 'technology', 'business')
 */
export async function discoverRedditTrends(categoryKey: TrendCategoryKey = 'all'): Promise<{
  success: boolean;
  trendsDiscovered: number;
  error?: string;
}> {
  try {
    const category = TREND_CATEGORIES[categoryKey];
    console.log(`🔍 Fetching trending posts from Reddit for category: ${category.name}...`);
    
    // Fetch posts from category-specific subreddits
    const subredditsToFetch = category.subreddits.slice(0, 3); // Fetch from top 3 subreddits
    
    const postPromises = subredditsToFetch.map(async (subreddit, index) => {
      const limit = index === 0 ? 40 : 30; // More from first subreddit
      try {
        return await fetchRedditTrendingPosts(subreddit, 'day', limit);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch from r/${subreddit}:`, error);
        return [];
      }
    });
    
    const allPostArrays = await Promise.all(postPromises);
    const allPosts = allPostArrays.flat();
    
    // Combine and deduplicate
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.data.title, post])).values()
    );
    
    console.log(`📊 Found ${uniquePosts.length} unique posts from ${category.name}`);
    
    // Filter for quality
    const qualityPosts = filterQualityPosts(uniquePosts);
    console.log(`✅ ${qualityPosts.length} quality posts after filtering`);
    
    if (qualityPosts.length === 0) {
      console.warn('⚠️ No quality posts found after filtering');
      return {
        success: false,
        trendsDiscovered: 0,
        error: 'No quality posts found',
      };
    }
    
    // Prepare data for AI analysis
    const postData = qualityPosts.map(post => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      score: post.data.score,
      num_comments: post.data.num_comments,
    }));
    
    console.log('🤖 Using AI to identify distinct trends from posts...');
    
    // Import Gemini API (dynamic import to avoid circular dependencies)
    const { analyzeRedditPostsForTrends, fallbackTrendExtraction } = await import('./geminiApi');
    
    let distinctTrends;
    
    try {
      // Use Gemini AI to analyze and extract distinct trends
      distinctTrends = await analyzeRedditPostsForTrends(postData);
    } catch (aiError) {
      console.warn('⚠️ AI analysis failed, using fallback method:', aiError);
      // Fallback to basic extraction if AI fails
      distinctTrends = fallbackTrendExtraction(postData);
    }
    
    console.log(`💎 Identified ${distinctTrends.length} distinct trends`);
    
    if (distinctTrends.length === 0) {
      return {
        success: false,
        trendsDiscovered: 0,
        error: 'No distinct trends identified',
      };
    }
    
    // Add category source to each trend
    const trendsWithCategory = distinctTrends.map(trend => ({
      ...trend,
      trend_category_source: categoryKey,
    }));
    
    console.log(`🗑️ Clearing old ${category.name} trends from database...`);
    
    // Delete old trends for this specific category before inserting new ones
    const { error: deleteError } = await supabase
      .from('trends')
      .delete()
      .match({ source: 'reddit', trend_category_source: categoryKey });
    
    if (deleteError) {
      console.warn('⚠️ Error deleting old trends (continuing anyway):', deleteError);
    } else {
      console.log(`✅ Old ${category.name} trends cleared`);
    }
    
    console.log(`💾 Saving ${trendsWithCategory.length} distinct trends to database...`);
    
    // Save to database
    const { data, error } = await supabase
      .from('trends')
      .insert(trendsWithCategory as any)
      .select();
    
    if (error) {
      console.error('❌ Error saving Reddit trends to database:', error);
      throw error;
    }
    
    console.log(`✅ Successfully saved ${data?.length || 0} distinct trends to database`);
    
    return {
      success: true,
      trendsDiscovered: data?.length || 0,
    };
  } catch (error) {
    console.error('❌ Error discovering Reddit trends:', error);
    return {
      success: false,
      trendsDiscovered: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch specific subreddit trends
 */
export async function discoverSubredditTrends(
  subreddit: string,
  limit: number = 20
): Promise<{
  success: boolean;
  trendsDiscovered: number;
  error?: string;
}> {
  try {
    console.log(`🔍 Fetching trends from r/${subreddit}...`);
    
    const posts = await fetchRedditTrendingPosts(subreddit, 'day', limit);
    const qualityPosts = filterQualityPosts(posts);
    
    if (qualityPosts.length === 0) {
      return {
        success: false,
        trendsDiscovered: 0,
        error: 'No quality posts found',
      };
    }
    
    const trends = qualityPosts.map(transformRedditPostToTrend);
    
    const { data, error } = await supabase
      .from('trends')
      .insert(trends)
      .select();
    
    if (error) throw error;
    
    return {
      success: true,
      trendsDiscovered: data?.length || 0,
    };
  } catch (error) {
    console.error(`Error discovering trends from r/${subreddit}:`, error);
    return {
      success: false,
      trendsDiscovered: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
