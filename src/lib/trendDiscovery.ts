import { supabase } from "@/integrations/supabase/client";

/**
 * Triggers the discover-trends edge function to fetch fresh trending topics
 * from external APIs (Reddit, Twitter, Google Trends)
 * @returns Promise with the result of the trend discovery operation
 */
export async function triggerTrendDiscovery() {
  try {
    const { data, error } = await supabase.functions.invoke('discover-trends', {
      method: 'POST',
    });

    if (error) {
      console.error('Error triggering trend discovery:', error);
      throw error;
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to trigger trend discovery:', error);
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
