export interface Trend {
  id: string;
  topic: string;
  description: string | null;
  source: string;
  category: string | null;
  growth_rate: number;
  engagement_score: number;
  trending_since: string;
  created_at: string;
  updated_at?: string;
}

export const generateMockTrends = (): Trend[] => {
  return [
    {
      id: crypto.randomUUID(),
      topic: "AI-Powered Video Editing",
      description: "Revolutionary AI tools transforming video content creation with automated editing, scene detection, and smart transitions.",
      source: "twitter",
      category: "Technology",
      growth_rate: 156,
      engagement_score: 92,
      trending_since: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      topic: "Sustainable E-commerce",
      description: "Growing consumer demand for eco-friendly packaging and carbon-neutral shipping options in online retail.",
      source: "google_trends",
      category: "Business",
      growth_rate: 127,
      engagement_score: 85,
      trending_since: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      topic: "Mindful Morning Routines",
      description: "Wellness trend focusing on intentional morning practices including meditation, journaling, and movement.",
      source: "reddit",
      category: "Lifestyle",
      growth_rate: 94,
      engagement_score: 78,
      trending_since: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      topic: "Remote Team Building",
      description: "Innovative virtual activities and tools for maintaining team cohesion in distributed work environments.",
      source: "twitter",
      category: "Business",
      growth_rate: 112,
      engagement_score: 81,
      trending_since: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      topic: "Personalized Nutrition Apps",
      description: "AI-driven nutrition platforms offering customized meal plans based on individual health data and preferences.",
      source: "google_trends",
      category: "Health",
      growth_rate: 143,
      engagement_score: 88,
      trending_since: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      topic: "Short-Form Video Marketing",
      description: "Brands leveraging TikTok, Reels, and Shorts for authentic storytelling and product demonstrations.",
      source: "twitter",
      category: "Marketing",
      growth_rate: 167,
      engagement_score: 95,
      trending_since: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      topic: "Web3 Community Building",
      description: "Decentralized communities using blockchain technology for governance, rewards, and member engagement.",
      source: "reddit",
      category: "Technology",
      growth_rate: 134,
      engagement_score: 82,
      trending_since: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      topic: "Micro-Learning Platforms",
      description: "Bite-sized educational content delivered through mobile apps for continuous skill development.",
      source: "google_trends",
      category: "Technology",
      growth_rate: 118,
      engagement_score: 76,
      trending_since: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    }
  ];
};
