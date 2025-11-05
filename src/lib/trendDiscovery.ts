import { supabase } from "@/integrations/supabase/client";
import { discoverRedditTrends, type TrendCategoryKey } from "./redditApi";

/**
 * Triggers the discover-trends edge function to fetch fresh trending topics
 * from external APIs (Reddit, Twitter, Google Trends)
 * @param categoryKey - The category to discover trends for
 * @returns Promise with the result of the trend discovery operation
 */
export async function triggerTrendDiscovery(categoryKey: TrendCategoryKey = 'all') {
  try {
    console.log(`🚀 Starting trend discovery process for category: ${categoryKey}...`);
    
    // First, try to discover trends from Reddit directly
    console.log('📡 Attempting to discover trends from Reddit...');
    const redditResult = await discoverRedditTrends(categoryKey);
    
    console.log('Reddit discovery result:', redditResult);
    
    if (redditResult.success && redditResult.trendsDiscovered > 0) {
      console.log(`✅ Discovered ${redditResult.trendsDiscovered} trends from Reddit`);
      
      return {
        success: true,
        data: {
          trendsDiscovered: redditResult.trendsDiscovered,
          source: 'reddit',
          category: categoryKey,
        },
      };
    }

    // If Reddit failed, log the error
    if (!redditResult.success) {
      console.error('❌ Reddit discovery failed:', redditResult.error);
    }

    // Fallback to edge function if Reddit fails or returns no results
    console.log('⚠️ Falling back to edge function for trend discovery...');
    const { data, error } = await supabase.functions.invoke('discover-trends', {
      method: 'POST',
    });

    if (error) {
      console.error('❌ Error triggering edge function:', error);
      throw error;
    }

    console.log('✅ Edge function response:', data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Failed to trigger trend discovery:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetches the latest trends from the database with optional filters
 */
export async function fetchLatestTrends(options?: {
  category?: string;
  limit?: number;
  sortBy?: 'growth_rate' | 'engagement_score' | 'created_at';
}) {
  try {
    const { category, limit = 50, sortBy = 'created_at' } = options || {};
    
    let query = supabase
      .from('trends')
      .select('*');
    
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    
    query = query
      .order(sortBy, { ascending: false })
      .limit(limit);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
    
    return {
      success: true,
      trends: data,
    };
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      trends: [],
    };
  }
}
