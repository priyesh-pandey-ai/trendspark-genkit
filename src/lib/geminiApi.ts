/**
 * Google Gemini AI Integration
 * Uses Gemini to analyze Reddit posts and extract distinct trending topics
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

interface RedditPostData {
  title: string;
  subreddit: string;
  score: number;
  num_comments: number;
}

interface DistinctTrend {
  topic: string;
  description: string;
  category: string;
  engagement_score: number;
  growth_rate: number;
  source: string;
  trending_since: string;
}

/**
 * Analyzes Reddit posts using Gemini AI to extract distinct trends
 */
export async function analyzeRedditPostsForTrends(
  posts: RedditPostData[]
): Promise<DistinctTrend[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('❌ Gemini API key not configured');
    throw new Error('Gemini API key not set in environment variables');
  }

  console.log('🤖 Analyzing Reddit posts with Gemini AI...');
  console.log(`📊 Processing ${posts.length} posts`);

  try {
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Prepare post data for analysis
    const postSummaries = posts.map((post, idx) => ({
      index: idx + 1,
      title: post.title,
      subreddit: post.subreddit,
      engagement: post.score + post.num_comments,
    }));

    const prompt = `You are a trend analysis expert. Analyze these ${posts.length} trending Reddit posts and identify the TOP 15 DISTINCT trending topics/themes.

REDDIT POSTS:
${JSON.stringify(postSummaries, null, 2)}

INSTRUCTIONS:
1. Group similar posts together to identify broader trending topics
2. Ignore duplicate or very similar topics - we want DISTINCT trends
3. Focus on substantial trends (at least 3-5 posts about the same topic)
4. Categorize each trend into one of: Technology, Business, Marketing, Health, or Lifestyle
5. Create engaging, descriptive titles (not just post titles)
6. Write compelling 1-2 sentence descriptions

For each distinct trend, provide:
- topic: A catchy, clear title for the trend (50 chars max)
- description: An engaging 1-2 sentence summary (150 chars max)
- category: One of [Technology, Business, Marketing, Health, Lifestyle]
- relatedPosts: Array of post indices that relate to this trend
- estimatedReach: Estimated total engagement (sum of related posts' engagement)

Return ONLY valid JSON array with this exact structure:
[
  {
    "topic": "string",
    "description": "string",
    "category": "string",
    "relatedPosts": [1, 2, 3],
    "estimatedReach": number
  }
]

Return exactly 15 trends or fewer if there aren't enough distinct topics. NO markdown, NO code blocks, ONLY the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log('✅ Gemini AI analysis complete');
    console.log('📝 Raw Gemini response:', responseText.substring(0, 200) + '...');

    // Parse the JSON response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const trends = JSON.parse(cleanedResponse);
    console.log(`✅ Extracted ${trends.length} distinct trends from AI analysis`);

    // Transform to our trend format
    const now = new Date().toISOString();
    const distinctTrends: DistinctTrend[] = trends.map((trend: any) => {
      // Calculate metrics
      const engagement = trend.estimatedReach || 1000;
      const growthRate = Math.min(Math.round((engagement / 100) * 2), 200);

      return {
        topic: trend.topic,
        description: trend.description,
        category: trend.category,
        engagement_score: Math.round(engagement / 10),
        growth_rate: Math.max(growthRate, 15),
        source: 'reddit',
        trending_since: now,
      };
    });

    return distinctTrends;
  } catch (error) {
    console.error('❌ Error analyzing posts with Gemini:', error);
    throw error;
  }
}

/**
 * Fallback method if Gemini fails - basic clustering
 */
export function fallbackTrendExtraction(posts: RedditPostData[]): DistinctTrend[] {
  console.log('⚠️ Using fallback trend extraction (no AI)');
  
  // Simple keyword-based grouping
  const trends: DistinctTrend[] = [];
  const now = new Date().toISOString();
  
  // Take top posts and create trends from them
  const topPosts = posts
    .sort((a, b) => (b.score + b.num_comments) - (a.score + a.num_comments))
    .slice(0, 15);
  
  topPosts.forEach(post => {
    const engagement = post.score + post.num_comments;
    
    trends.push({
      topic: post.title.substring(0, 80),
      description: `Trending discussion from r/${post.subreddit}`,
      category: categorizeBySubreddit(post.subreddit),
      engagement_score: Math.round(engagement / 10),
      growth_rate: Math.min(Math.round((engagement / 100) * 2), 200),
      source: 'reddit',
      trending_since: now,
    });
  });
  
  return trends;
}

function categorizeBySubreddit(subreddit: string): string {
  const sub = subreddit.toLowerCase();
  
  if (sub.includes('tech') || sub.includes('programming') || sub.includes('ai')) {
    return 'Technology';
  }
  if (sub.includes('business') || sub.includes('entrepreneur') || sub.includes('finance')) {
    return 'Business';
  }
  if (sub.includes('marketing') || sub.includes('advertising')) {
    return 'Marketing';
  }
  if (sub.includes('health') || sub.includes('fitness')) {
    return 'Health';
  }
  
  return 'Lifestyle';
}
