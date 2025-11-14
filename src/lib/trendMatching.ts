/**
 * Trend matching and ranking utility
 * Scores trends based on alignment with brand niche
 */

interface BrandNicheKeywords {
  [niche: string]: string[];
}

// Keywords for different niches to match with trends
const NICHE_KEYWORDS: BrandNicheKeywords = {
  technology: ['ai', 'tech', 'software', 'code', 'app', 'digital', 'automation', 'machine learning', 'startup', 'innovation', 'programming', 'data', 'cloud'],
  fashion: ['style', 'clothing', 'design', 'trend', 'outfit', 'brand', 'luxury', 'beauty', 'aesthetic', 'designer', 'collection'],
  fitness: ['workout', 'gym', 'health', 'exercise', 'training', 'fitness', 'diet', 'nutrition', 'sport', 'wellness', 'body'],
  finance: ['money', 'investing', 'stock', 'crypto', 'banking', 'fintech', 'wealth', 'trading', 'loan', 'insurance', 'investment'],
  ecommerce: ['shop', 'store', 'product', 'sale', 'deal', 'market', 'commerce', 'retail', 'shopping', 'delivery', 'discount'],
  marketing: ['marketing', 'content', 'social', 'advertising', 'campaign', 'brand', 'engagement', 'audience', 'reach', 'viral', 'seo'],
  entertainment: ['movie', 'music', 'show', 'entertainment', 'celebrity', 'film', 'streaming', 'video', 'actor', 'artist', 'production'],
  food: ['food', 'recipe', 'cooking', 'restaurant', 'cuisine', 'chef', 'drink', 'meal', 'dish', 'kitchen', 'taste'],
  travel: ['travel', 'destination', 'trip', 'hotel', 'tourism', 'vacation', 'adventure', 'flight', 'explore', 'world', 'journey'],
  education: ['learning', 'course', 'student', 'teacher', 'education', 'school', 'university', 'skill', 'training', 'academy', 'study'],
  real_estate: ['property', 'house', 'real estate', 'home', 'apartment', 'building', 'agent', 'mortgage', 'land', 'rent', 'development'],
  healthcare: ['health', 'medical', 'doctor', 'hospital', 'wellness', 'therapy', 'disease', 'treatment', 'medicine', 'care', 'clinic'],
};

/**
 * Scores a trend based on alignment with brand niche
 */
export function scoreUnicTrendAlignment(trendTopic: string, trendDescription: string, brandNiche?: string): number {
  if (!brandNiche) return 0;

  const niche = brandNiche.toLowerCase().trim();
  const keywords = NICHE_KEYWORDS[niche] || [];
  
  if (keywords.length === 0) return 0;

  const combinedText = `${trendTopic} ${trendDescription}`.toLowerCase();
  
  // Count keyword matches
  let matches = 0;
  keywords.forEach(keyword => {
    if (combinedText.includes(keyword)) {
      matches++;
    }
  });

  // Score out of 100
  // More matches = higher score
  const score = (matches / keywords.length) * 100;
  return Math.round(score);
}

/**
 * Ranks trends by alignment with brand
 */
export function rankTrendsByBrandFit(trends: any[], brandNiche?: string, limit: number = 10): any[] {
  if (!brandNiche || trends.length === 0) return [];

  const rankedTrends = trends.map(trend => ({
    ...trend,
    brandAlignmentScore: scoreUnicTrendAlignment(
      trend.topic,
      trend.description,
      brandNiche
    ),
  }));

  return rankedTrends
    .filter(t => t.brandAlignmentScore > 0) // Only include matching trends
    .sort((a, b) => b.brandAlignmentScore - a.brandAlignmentScore)
    .slice(0, limit);
}
